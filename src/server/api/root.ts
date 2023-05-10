import { createTRPCRouter } from "~/server/api/trpc";
import { campaignRouter, clientRouter, organizationRouter, restaurantRouter } from "~/server/api/routers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  campaign: campaignRouter,
  organization: organizationRouter,
  restaurant: restaurantRouter,
  client: clientRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
