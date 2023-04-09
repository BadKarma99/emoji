import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "(~/)/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user:User) => {

    return{
        id: user.id, name: user.username, profilePicture: user.profileImageUrl
    }

}


// Create a new ratelimiter, that allows 3 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */ 
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({

  getAll: publicProcedure.query(async ({  ctx }) => {
    const post = await  ctx.prisma.post.findMany(
        {
            take: 100,
            orderBy:[
                {
                    createdAt: 'desc'
                }
            ]
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
    return post.map((post) => {

        const auther = users.find((user) => user.id === post.autherId)
        if(!auther) throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: 'Author for the Post not found'})
        return {
        post,
        auther: {
            ...auther,
            name : auther.name
        },
        };
    })
  }),

    create: privateProcedure.input(z.object({
        content: z.string().emoji("only emojis are allowed").min(1).max(280),
    })).mutation(async ({ ctx,input }) => {
        const autherId = ctx.currentUser;

        const {success} = await ratelimit.limit( autherId);

        if(!success) throw new TRPCError({code: 'TOO_MANY_REQUESTS', message: 'You are doing that too much'})

        const post = await ctx.prisma.post.create({
            data: {
                autherId,
                content: input.content,

            },
        });

        return post;
    }),
});
