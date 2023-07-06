

import { type GetServerSideProps } from "next";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { elkOptions } from "./elkClientOptions";
import { Client } from "@elastic/elasticsearch";
import { getServerAuthSession } from "~/server/auth";

export const hasAccessToRestaurant: GetServerSideProps = async (context) => {
    const elkClient = new Client(elkOptions);
    const caller = appRouter.createCaller({ prisma: prisma, session: await getServerAuthSession(context), pathNameReferer: null, elkClient: elkClient });

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

    await elkClient.close();

    return {
        props: {},
    };
};
