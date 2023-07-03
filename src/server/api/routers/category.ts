import {
	createTRPCRouter,
	protectedProcedure
} from "~/server/api/trpc";

export const categoryRouter = createTRPCRouter({

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),

});
