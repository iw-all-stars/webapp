import { useCallback, useEffect, useState } from "react";
import { type NextPage } from "next";
import {
  Box,
  Button,
  CircularProgress,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { MdAddChart } from "react-icons/md";
import { format } from "date-fns";
import CampaignModal from "~/components/campaignModal";
import { type Campaign } from "@prisma/client";

const DashboardCampaign: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getCampaigns = api.campaign.getCampaigns.useQuery();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

  const editCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    onOpen();
  };

  useEffect(() => {
    getCampaigns.refetch();
  }, []);

  const closeModal = useCallback(() => {
    onClose();
    setSelectedCampaign(undefined);
  }, []);

  return (
    <Box h="full" w="full" pt={8}>
      <Box w="full" display="flex" justifyContent="space-between">
        <Heading>Campagnes</Heading>
        <Button
          onClick={onOpen}
          size="sm"
          leftIcon={<MdAddChart />}
          colorScheme="green"
          variant="ghost"
        >
          Créer une campagne
        </Button>
      </Box>
      <br />
      <TableContainer>
        <Table variant="striped" colorScheme="gray" size="sm">
          <Thead>
            <Tr>
              <Th w="lg">Nom</Th>
              <Th w="40">Date</Th>
              <Th w="40">Type</Th>
              <Th isNumeric>Mails envoyés</Th>
              <Th isNumeric>Taux d'ouverture</Th>
              <Th isNumeric>Désabonnement</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {getCampaigns.data?.map((campaign) => {
              const sentMails = campaign.mail.length;
              const openRate =
                campaign.mail.length === 0
                  ? 0
                  : (campaign.mail
                      .map((mail) => mail.opened)
                      .filter((opened) => opened).length /
                      sentMails) *
                    100;
              const unsubscribeRate =
                campaign.mail.length === 0
                  ? 0
                  : (campaign.mail
                      .map((mail) => mail.unsub)
                      .filter((unsub) => unsub).length /
                      sentMails) *
                    100;
              const date = format(new Date(campaign.createdAt), "dd/MM/yyyy");
              return (
                <Tr
                  key={campaign.id}
                  cursor={"pointer"}
                  onClick={() => editCampaign(campaign)}
                >
                  <Td>{campaign.name}</Td>
                  <Td>{date}</Td>
                  <Td>{campaign.type.name}</Td>
                  <Td>{sentMails}</Td>
                  <Td>{openRate} %</Td>
                  <Td>{unsubscribeRate} %</Td>
                  <Td>{campaign.status}</Td>
                </Tr>
              );
            })}
          </Tbody>
          {getCampaigns.data && getCampaigns.data?.length > 20 ? (
            <Tfoot>
              <Tr>
                <Th w="lg">Nom</Th>
                <Th w="40">Date</Th>
                <Th w="40">Type</Th>
                <Th isNumeric>Mails envoyés</Th>
                <Th isNumeric>Taux d'ouverture</Th>
                <Th isNumeric>Désabonnement</Th>
                <Th>Status</Th>
              </Tr>
            </Tfoot>
          ) : null}
        </Table>
        {getCampaigns.isFetching ? (
          <Box mt={"4"} w={"full"} display={"flex"} justifyContent={"center"}>
            <CircularProgress isIndeterminate color="green.300" />
          </Box>
        ) : null}
      </TableContainer>
      <CampaignModal
        isOpen={isOpen}
        onClose={closeModal}
        campaign={selectedCampaign}
      />
    </Box>
  );
};

export default DashboardCampaign;
