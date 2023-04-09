import { type NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "../components";

dayjs.extend(relativeTime);


import { RouterOutputs, api } from "(~/)/utils/api";
import {
  SignIn,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-hot-toast";

type postWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: postWithUser) => {
  const { post, auther } = props;
  return (
    <div key={post.id} className="border-b border-slate-200 p-8 flex gap-3">
      <img src = {auther.profilePicture} className="h-10 w-10 rounded-full" />
      <div className="flex flex-col">
      <div className="flex gap-2 text-slate-500">
      <span className="">{auther.name}</span>
      <span className="text-slate-500">{`- ${dayjs(post.createdAt).fromNow()}`}</span>
      </div>
      <div>{post.content}</div>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutateAsync: createPost,isLoading: posting } = api.posts.create.useMutation(
    {onSuccess: () => {
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {

      const error = e.data?.zodError?.fieldErrors.content;
      if(error && error[0]){
        toast.error(error[0]);
      }
      // toast.error("Failed to create post");
    }}
  );


  if (!user) return null;
  if(posting) return <LoadingSpinner/>;

  return (
    <div className="flex gap-3">
      <img src={user.profileImageUrl} className="h-10 w-10 rounded-full" />
      <input
        placeholder="Type some Emojis"
        className="grow border-none bg-transparent focus:outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => {
        createPost({ content: input }),
        setInput("")
    
    }}>Post</button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading:postsLoading } = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingSpinner/>;

  if(!data) return <div>Failed to load</div>;

  return(
    <div className="flex flex-col ">
            {data.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id}/>
            ))}
    </div>

  );
}

const Home: NextPage = () => {
  const {user, isLoaded:userLoaded,isSignedIn } = useUser();
  console.log(user);
  // to start fetching asap we are calling it 
  api.posts.getAll.useQuery();

  // return empty div if user or posts are not loaded coz user loads faster than posts

  if(!userLoaded ) return <div/>;


  return (
    <>
      <Head>
        <title>Twitter</title>
        <meta name="description" content="Emoji Twitter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full max-w-2xl border-x border-slate-200">
          <div className="border-b border-slate-200 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
