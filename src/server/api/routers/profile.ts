import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "(~/)/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "../../helpers/filterUserForClients";


export const ProfileRouter = createTRPCRouter({

    getUserByUsername: publicProcedure.input(z.object({username: z.string()})).query(async ({   input }) => {

        const [user] = await clerkClient.users.getUserList({username: [input.username]})

        if(!user) throw new TRPCError({code: 'NOT_FOUND', message: 'User not found'})

        return filterUserForClient(user);

    }),
  
});
