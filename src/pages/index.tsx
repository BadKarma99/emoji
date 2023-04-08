import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "(~/)/utils/api";
import {
  SignIn,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";



const CreatePostWizard = () => {
  const {user} = useUser();
  if(!user) return null;

  return(
    <div className="flex gap-3">
      <img 
      src = {user.profileImageUrl} className="w-10 h-10 rounded-full"
      />
      <input 
      placeholder="Type some Emojis"
      className="bg-transparent border-none focus:outline-none grow"
      />
      </div>
  )
}

const Home: NextPage = () => {
  const user = useUser();
  console.log(user)
  const { data,isLoading } = api.posts.getAll.useQuery();

  if (isLoading ) return <div>Loading...</div>;
  if (!data) return <div>Failed to load</div>;

  return (
    <>
      <Head>
        <title>Twitter</title>
        <meta name="description" content="Emoji Twitter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="border-x h-full border-slate-200 w-full max-w-2xl">
          <div className="border-b border-slate-200 p-4">
            {!user.isSignedIn && 
            <div className="flex justify-center">
            <SignInButton />
            </div>
            }
            {!!user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col ">
          {[...data,...data]?.map(({post,auther}) => (
            <div key={post.id}
            className="p-8 border-b border-slate-200"
            >
              <div>{post.content}</div>
            </div>
          ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
