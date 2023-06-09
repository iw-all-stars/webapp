import { PostType } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, hasAccessToRestaurantProcedure } from "~/server/api/trpc";

const createPost = z.object({
    originalUrl: z.string(),
    name: z.string(),
    type: z.enum([PostType.IMAGE, PostType.VIDEO]),
});

export type CreatePost = z.infer<typeof createPost>;

export const postRouter = createTRPCRouter({

    createMany: hasAccessToRestaurantProcedure
        .input(z.array(createPost))
        .mutation(async ({ ctx, input }) => {
            await ctx.prisma.post.createMany({
                data: input,
            });
            // return list ids of created posts
            return ctx.prisma.post.findMany({
                where: {
                    name: {
                        in: input.map((post) => post.name),
                    },
                },
            })
            
        }),
});
