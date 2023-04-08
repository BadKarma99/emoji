import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "(~/)/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/dist/api";

const filterUserForClient = (user:User) => {

    return{
        id: user.id, name: user.username, profilePicture: user.profileImageUrl
    }

}

export const postRouter = createTRPCRouter({

  getAll: publicProcedure.query(async ({  ctx }) => {
    const post = await  ctx.prisma.post.findMany(
        {
            take: 100,
        }
    );
    const users = (
        await clerkClient.users.getUserList(
        {
            userId: post.map((p) => p.autherId),
            limit:100
        }
    )).map(filterUserForClient);
    console.log(users)
    return post.map((post) => ({
        post,
        auther: users.find((user) => user.id === post.autherId),
    }))
  }),
});
