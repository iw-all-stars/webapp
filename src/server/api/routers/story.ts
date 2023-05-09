
import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure
} from "~/server/api/trpc";

const createPost = z.object({
    url : z.string(),
    position: z.number().int().gte(0),
    type: z.enum(["image", "video"]),
})

const createStory = z.object({
    name: z.string(),
    publishedAt: z.string(),
    posts: z.array(createPost),
})

export type CreatePost = z.infer<typeof createPost>;

export type CreateStory = z.infer<typeof createStory>;

export const storyRouter = createTRPCRouter({

  create: publicProcedure.input(createStory).mutation(async ({ ctx, input }) => {

    const publishedAt = new Date(input.publishedAt);

    const story = await ctx.prisma.story.create(
        {
            data: {
                name: input.name,
                publishedAt: publishedAt,
                posts: {
                    create: input.posts,
                }
            }
        }
    );
    return story;
  }),

});
