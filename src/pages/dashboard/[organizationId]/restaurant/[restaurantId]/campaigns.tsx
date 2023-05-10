import { useEffect } from "react";
import { type NextPage } from "next";
import {
  Box,
  Button,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { MdAddChart } from "react-icons/md";

const DashboardCampaign: NextPage = () => {
  const getCampaigns = api.campaign.getCampaigns.useQuery();

  useEffect(() => {
    getCampaigns.refetch();
  }, []);

  return (
    <Box h="full" w="full" pt={8}>
      <Box w="full" display="flex" justifyContent="space-between">
        <Heading>Campagnes</Heading>
        <Button size="sm" leftIcon={<MdAddChart />} colorScheme="green" variant="ghost">
          Créer une campagne
        </Button>
      </Box>
      <br />
      <TableContainer>
        <Table variant="striped" colorScheme="gray" size="sm">
          <Thead>
            <Tr>
              <Th>Campagne</Th>
              <Th>Sujet</Th>
              <Th w="40">Type</Th>
              <Th w="40">Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {getCampaigns.isFetching
              ? [...Array(6)].map((_, index) => (
                  <Tr key={index}>
                    {[...Array(4)].map((_, index) => (
                      <Td key={index}>
                        <Skeleton h={4} />
                      </Td>
                    ))}
                  </Tr>
                ))
              : null}
            {getCampaigns.data?.map((campaign) => (
              <Tr key={campaign.id}>
                <Td>{campaign.name}</Td>
                <Td>{campaign.type}</Td>
                <Td>{campaign.subject}</Td>
                <Td>{campaign.status}</Td>
              </Tr>
            ))}
          </Tbody>
          {getCampaigns.data && getCampaigns.data?.length > 20 ? (
            <Tfoot>
              <Tr>
                <Th>Campagne</Th>
                <Th>Type</Th>
                <Th>Sujet</Th>
                <Th>Status</Th>
              </Tr>
            </Tfoot>
          ) : null}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardCampaign;
