import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  test: publicProcedure.mutation(({ ctx }) => {
    const res = ctx.prisma.story.findFirst({
        include: {
            posts: true,
        }
    });
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return {
        data: []
    }
  }),

//   getSecretMessage: protectedProcedure.query(() => {
//     return "you can now see this secret message!";
//   }),
});
