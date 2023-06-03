import { useCallback, useEffect, useState } from "react";
import { type NextPage } from "next";
import {
  Box,
  Button,
  ColorHues,
  Colors,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { format } from "date-fns";
import CampaignModal from "~/components/campaignModal";
import { type Campaign } from "@prisma/client";
import { SearchIcon } from "@chakra-ui/icons";
import CreateCustomerModal from "~/components/campaignModal/createCustomerModal";

const DashboardCampaign: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCreateCustomerModalOpen,
    onOpen: onOpenCreateCustomerModal,
    onClose: onCloseCreateCustomerModal,
  } = useDisclosure();
  const getCampaigns = api.campaign.getCampaigns.useQuery();
  const getClients = api.customer.getClients.useQuery();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

  const editCampaign = (campaign: Campaign) => {
    if (!getClients.data?.length) {
      return;
    }
    setSelectedCampaign(campaign);
    onOpen();
  };

  const createCampaign = () => {
    if (!getClients.data?.length) {
      onOpenCreateCustomerModal();
      return;
    }
    setSelectedCampaign(undefined);
    onOpen();
  };

  useEffect(() => {
    getCampaigns.refetch();
    getClients.refetch();
  }, []);

  const closeModal = useCallback(() => {
    onClose();
    setSelectedCampaign(undefined);
  }, []);

  return (
    <Box h="full" w="full" pt={8}>
      <Box
        w="full"
        display="flex"
        justifyContent="space-between"
        gap={4}
        alignItems={"center"}
      >
        <Heading
          display={"flex"}
          flexDirection={"row"}
          gap={1}
          fontSize={18}
          fontWeight={400}
        >
          <b>Campagnes</b>
          <Text letterSpacing={"widest"} fontStyle={"italic"}>
            ({getCampaigns.data?.length})
          </Text>
        </Heading>
        <InputGroup>
          <Input placeholder="Recherche" />
          <InputRightElement children={<SearchIcon />} />
        </InputGroup>
        <Button
          onClick={createCampaign}
          fontSize={12}
          colorScheme="green"
          variant="solid"
          minW={"min-content"}
        >
          Créer une campagne
        </Button>
      </Box>
      <br />
      <TableContainer>
        <Table variant="striped" colorScheme="gray" size="md" fontSize={13}>
          <Thead>
            <Tr>
              <Th
                fontSize={12}
                fontWeight={500}
                textTransform="capitalize"
                w="lg"
              >
                Nom
              </Th>
              <Th
                fontSize={12}
                fontWeight={500}
                textTransform="capitalize"
                w="40"
              >
                Date
              </Th>
              <Th
                fontSize={12}
                fontWeight={500}
                textTransform="capitalize"
                w="40"
              >
                Type
              </Th>
              <Th
                fontSize={12}
                fontWeight={500}
                textTransform="capitalize"
                isNumeric
              >
                Mails envoyés
              </Th>
              <Th
                fontSize={12}
                fontWeight={500}
                textTransform="capitalize"
                isNumeric
              >
                Taux d'ouverture
              </Th>
              <Th
                fontSize={12}
                fontWeight={500}
                textTransform="capitalize"
                isNumeric
              >
                Désabonnement
              </Th>
              <Th fontSize={12} fontWeight={500} textTransform="capitalize">
                Status
              </Th>
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
                  <Td>
                    <Tag backgroundColor={campaign.type.color as string}>
                      {campaign.type.name}
                    </Tag>
                  </Td>
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
      </TableContainer>
      <CampaignModal
        isOpen={isOpen}
        onClose={closeModal}
        campaign={selectedCampaign}
      />
      <CreateCustomerModal
        isOpen={isCreateCustomerModalOpen}
        onClose={onCloseCreateCustomerModal}
        onOpen={onOpenCreateCustomerModal}
      />
    </Box>
  );
};

export default DashboardCampaign;
