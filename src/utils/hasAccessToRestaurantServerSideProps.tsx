

import { type GetServerSideProps } from "next";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

export const hasAccessToRestaurant: GetServerSideProps = async (context) => {
    const caller = appRouter.createCaller({ prisma: prisma, session: null });

    const hasAccessToRestaurant =
        await caller.restaurant.userHasAccessToRestaurant({
            organizationId: context.params?.organizationId as string,
            restaurantId: context.params?.restaurantId as string,
        });

    if (!hasAccessToRestaurant) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
};
