import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import Clients from "~/components/Campaigns/Clients";

import { type GetServerSideProps } from "next";
import { hasAccessToRestaurant } from "~/utils/hasAccessToRestaurantServerSideProps";
import DashboardCampaign from "../../../../../components/Campaigns/campaigns";

export const getServerSideProps: GetServerSideProps = async (context) => {
    return hasAccessToRestaurant(context);
};

export const Campaigns = () => {
    const router = useRouter();
    const [tabIndex, setTabIndex] = React.useState(0);

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

    useEffect(() => {
        if (router.query.tab === "customers") {
            setTabIndex(1);
        }
    }, [router.query.tab]);

    return (
        <Box h="full" w="full" pt={3}>
            <Box
                w="full"
                display="flex"
                justifyContent="space-between"
                gap={4}
                alignItems={"center"}
            >
                <Tabs
                    w="full"
                    index={tabIndex}
                    onChange={(index) => {
                        setTabIndex(index);
                        if (index === 0) {
                            router.push(
                                `/dashboard/${
                                    router.query.organizationId as string
                                }/restaurant/${
                                    router.query.restaurantId as string
                                }/campaigns`
                            );
                        } else if (index === 1) {
                            router.push(
                                `/dashboard/${
                                    router.query.organizationId as string
                                }/restaurant/${
                                    router.query.restaurantId as string
                                }/campaigns?tab=customers`
                            );
                        }
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
