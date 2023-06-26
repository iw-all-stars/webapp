import React from "react";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Clients from "~/components/Campaigns/Clients";
import DashboardCampaign from "../../../../../components/Campaigns/campaigns";

export const Campaigns = () => {
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
    <Box h="full" w="full" pt={8}>
      <Box
        w="full"
        display="flex"
        justifyContent="space-between"
        gap={4}
        alignItems={"center"}
      >
        <Tabs w="full">
          <TabList>
            {tabs.map((tab) => (
              <Tab
                key={tab.slug}
              >
                {tab.title}
              </Tab>
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
