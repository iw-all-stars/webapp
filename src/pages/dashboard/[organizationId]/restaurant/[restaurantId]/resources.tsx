import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Clients from "~/components/Resources/Clients";

export const Resources = () => {
  const tabs = [
    {
      title: "Galerie",
      slug: "gallery",
      content: () => <Box>Galerie</Box>,
    },
    {
      title: "Modèles d'avis",
      slug: "reviews",
      content: () => <Box>Modèles d'avis</Box>,
    },
    {
      title: "Modèle de message",
      slug: "message",
      content: () => <Box>Modèle de message</Box>,
    },
    {
      title: "Clients",
      slug: "clients",
      content: () => <Clients />,
    },
  ];

  const [defaultTab, setDefaultTab] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const panel = router.query.panel;
    if (panel) {
      const index = tabs.findIndex((tab) => tab.slug === panel);
      if (index !== -1) {
        setDefaultTab(index);
      }
    }
  }, [router.query.panel, tabs, setDefaultTab]);

  return (
    <Box h="full" w="full" pt={8}>
      <Box
        w="full"
        display="flex"
        justifyContent="space-between"
        gap={4}
        alignItems={"center"}
      >
        <Tabs w="full" index={defaultTab}>
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

export default Resources;
