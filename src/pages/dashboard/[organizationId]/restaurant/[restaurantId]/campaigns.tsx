import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

import Clients from "~/components/Campaigns/Clients";

import { type GetServerSideProps } from "next";
import { hasAccessToRestaurant } from "~/utils/hasAccessToRestaurantServerSideProps";
import DashboardCampaign from "../../../../../components/Campaigns/campaigns";

export const getServerSideProps: GetServerSideProps = async (context) => {
    return hasAccessToRestaurant(context);
};

export const Campaigns = () => {
    const router = useRouter();
    const tabIndex = router.query.tab === "customers" ? 1 : 0;

    const tabs = [
        {
            title: "Campagnes",
            slug: "campaigns",
            content: () => <DashboardCampaign />,
        },
        {
            title: "Clients",
            slug: "clients",
            content: () => <Clients />,
        },
    ];

    return (
        <Box h="full" w="full" pt={3}>
            <Box
                w="full"
                display="flex"
                justifyContent="space-between"
                gap={4}
                alignItems="center"
            >
                <Tabs
                    w="full"
                    index={tabIndex}
                    defaultIndex={tabIndex}
                    onChange={index => {
                        index === 1 ? router.query.tab = "customers" : delete router.query.tab;
                        router.push(router);
                    }}
                >
                    <TabList>
                        {tabs.map((tab) => (
                            <Tab key={tab.slug}>{tab.title}</Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {tabs.map((tab, idx) => (
                            <TabPanel key={idx}>{tab.content()}</TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default Campaigns;
