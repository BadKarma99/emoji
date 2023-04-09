import React from 'react'
import { api } from '../utils/api'
import { LoadingSpinner } from '../components'
import { appRouter } from '../server/api/root'
import { prisma } from '../server/db'
import superjson  from 'superjson'
import type { GetStaticProps, InferGetServerSidePropsType, NextPage } from 'next'
import Image from 'next/image'
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Head } from 'next/document'
import { PageLayout } from '../components/page_layout'
import { PostView } from '../components/postview'


type PageProps = InferGetServerSidePropsType<typeof getStaticProps>

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
              <PostView key={fullPost.posts.id} {...fullPost} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<PageProps> = ({username}) => {

    const {data,isLoading} = api.profile.getUserByUsername.useQuery({username})

    if(isLoading){
        return <LoadingSpinner />
    }
    if(!data){
        return <div>404</div>
    }

  return (
    <>
          <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <img
            src={data.profilePicture}
            alt={`${data.name }'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.name 
          }`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {

    const ssg = createServerSideHelpers({
        router: appRouter,
        ctx: {prisma, userId: null},
        transformer: superjson, // optional - adds superjson serialization
      });

      const slug  = context.params?.slug

      if(typeof slug !== 'string') throw new Error('Slug is not a string')

      const username = slug.replace('@','')


     await ssg.profile.getUserByUsername.prefetch({username: slug})

      return {
        props: {
            trpcState: ssg.dehydrate(),
            username
        }
      }

}

export const getStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export default ProfilePage

