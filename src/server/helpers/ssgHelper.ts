import { appRouter } from "../api/root";
import { prisma } from "../db";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";



export const generateSSGHelper= () =>  createServerSideHelpers({
        router: appRouter,
        ctx: {prisma, userId: null},
        transformer: superjson, // optional - adds superjson serialization
      });