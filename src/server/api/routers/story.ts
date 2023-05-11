import { StoryStatus } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const createPost = z.object({
    url: z.string(),
    position: z.number().int().gte(0),
    type: z.enum(["image", "video"]),
});

const createStory = z
    .object({
        name: z.string(),
        posts: z.array(createPost).min(1),
        publishedAt: z.string().optional(),
        status: z.enum([StoryStatus.DRAFT, StoryStatus.SCHEDULED, StoryStatus.NOW]),
    })
    .refine(
        (data) => {
            if (!data.publishedAt) {
                return data.status === StoryStatus.DRAFT;
            }
            return true;
        },
        {
            message: "publishedAt must be undefined when status is DRAFT",
        }
    );

export type CreatePost = z.infer<typeof createPost>;

export type CreateStory = z.infer<typeof createStory>;

export const storyRouter = createTRPCRouter({
    create: publicProcedure
        .input(createStory)
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.story.create({
                data: {
                    name: input.name,
                    publishedAt: input.publishedAt
                        ? new Date(input.publishedAt)
                        : undefined,
                    status: input.status,
                    posts: {
                        create: input.posts,
                    },
                },
            });
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.story.delete({
                where: {
                    id: input.id,
                },
            });
        }),
});
