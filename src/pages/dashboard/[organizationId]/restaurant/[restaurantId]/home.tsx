import { type NextPage } from "next";
import { Box, Grid, StatGroup, Stat, StatLabel, StatNumber, TableContainer, Table, Thead, Tbody, Tr, Th, GridItem, Skeleton } from "@chakra-ui/react";
import { api } from "~/utils/api";
import { useMemo } from "react";

const DashboardHome: NextPage = () => {

  const { data: countClientsByRestaurant, isLoading: isLoadingCountClientsByRestaurant } = api.customer.getCountClientsByRestaurant.useQuery();
  const { data: countCampaignsByRestaurant, isLoading: isLoadingCountCampaignsByRestaurant } = api.campaign.getCountCampaignsByRestaurant.useQuery();
  const { data: countStoriesByRestaurant, isLoading: isLoadingCountStoriesByRestaurant } = api.story.getCountByRestaurant.useQuery();

  const topMetrics = useMemo(() => {
    if (!(countClientsByRestaurant && countCampaignsByRestaurant && countStoriesByRestaurant)) return Array(3).fill({}) as { name: string, slug: string, total: number, byRestaurants: { restaurantName: string, count: number }[] }[];
    return [
      {
        name: "Clients",
        slug: "clients",
        total: countClientsByRestaurant.reduce((sum, a) => sum + a.count, 0),
        byRestaurants: countClientsByRestaurant
      },
      {
        name: "Campagnes",
        slug: "campaigns",
        total: countCampaignsByRestaurant.reduce((sum, a) => sum + a.count, 0),
        byRestaurants: countCampaignsByRestaurant
      },
      {
        name: "Stories",
        slug: "stories",
        total: countStoriesByRestaurant.reduce((sum, a) => sum + a.count, 0),
        byRestaurants: countStoriesByRestaurant
      }
    ];
  }, [countClientsByRestaurant, countCampaignsByRestaurant, countStoriesByRestaurant]);

  return (
    <Box mt={8}>
      <Grid templateColumns="repeat(3, 1fr)" gap={8} px={4}>
        {topMetrics.map((metric, index) => !isLoadingCountClientsByRestaurant && !isLoadingCountCampaignsByRestaurant && !isLoadingCountStoriesByRestaurant ? (
          <GridItem key={metric.slug} py={4} px={6} shadow="md" bg="white" rounded="xl">
            <StatGroup>
              <Stat>
                <StatLabel fontSize="xl">{metric.name}</StatLabel>
                <StatNumber lineHeight="normal" fontSize="4xl">{metric.total}</StatNumber>
              </Stat>
            </StatGroup>
            <TableContainer mt={3}>
              <Table size="md">
                <Thead>
                  <Tr>
                    <Th>Restaurant</Th>
                    <Th>{metric.name}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {metric.byRestaurants.map((restaurant) => (
                    <Tr key={restaurant.restaurantName}>
                      <Th>{restaurant.restaurantName}</Th>
                      <Th>{restaurant.count}</Th>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </GridItem>
        ) : (
          <GridItem key={index} py={4} px={6} shadow="md" bg="white" rounded="xl">
            <StatGroup>
              <Stat>
                <Skeleton h={7} w={20} />
                <Skeleton h={9} w={32} mt={3} />
              </Stat>
            </StatGroup>
            <TableContainer mt={4}>
              <Table size="md">
                <Thead>
                  <Tr>
                    <Th><Skeleton h={3} w={20} /></Th>
                    <Th><Skeleton h={3} w={20} /></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array(2).fill(0).map((_, index) => (
                    <Tr key={index}>
                      <Th><Skeleton h={3} w={20} /></Th>
                      <Th><Skeleton h={3} w={20} /></Th>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardHome;
