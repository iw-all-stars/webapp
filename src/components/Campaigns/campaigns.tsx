import { useCallback, useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  SkeletonCircle,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { type Mail, type Campaign, type User } from "@prisma/client";
import { SearchIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import React from "react";
import { api } from "~/utils/api";
import CampaignModal from "~/components/Campaigns/campaignModal";
import CreateCustomerModal from "~/components/Campaigns/campaignModal/createCustomerModal";
import { CampaignContext } from "./CampaignContext";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "~/components/DataTable";
import { useDebounce } from "usehooks-ts";

const defaultLimit = 5;

const DashboardCampaign: React.FC = () => {

  const context = useContext(CampaignContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isCreateCustomerModalOpen,
    onOpen: onOpenCreateCustomerModal,
    onClose: onCloseCreateCustomerModal,
  } = useDisclosure();

  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = React.useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const { data: countClients } = api.customer.getCountClients.useQuery(undefined, {
    initialData: 0,
  });

  const { data: countCampaigns } = api.campaign.getCountCampaigns.useQuery(debouncedSearch, {
    initialData: 0,
  });

  const { data: campaigns, refetch: refetchCampaigns, isLoading, isRefetching } = api.campaign.getCampaigns.useQuery(debouncedSearch);
  const getClients = api.customer.getClients.useQuery({});

  const columnHelper = createColumnHelper<Campaign & { mail: Mail[], user: User }>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Nom"
    }),
    columnHelper.accessor("updatedAt", {
      cell: (info) => format(new Date(info.getValue()), "dd/MM/yyyy"),
      header: "Date de création"
    }),
    columnHelper.display({
      id: "mails-sent",
      header: "Mails envoyés",
      cell: (campaign) => campaign.row.original.mail.length
    }),
    columnHelper.display({
      id: "mails-opened",
      header: "Taux d'overture",
      cell: (campaign) => {
        return campaign.row.original.mail.length === 0
          ? 0
          : ((campaign.row.original.mail
              .map((mail) => mail.opened)
              .filter((opened) => opened).length / campaign.row.original.mail.length)
            * 100
          ).toFixed(1) + " %"
      }
    }),
    columnHelper.display({
      id: "deliverability",
      header: "Désabonnement",
      cell: (campaign) => {
        return campaign.row.original.mail.length === 0
          ? 0
          : ((campaign.row.original.mail
              .map((mail) => mail.unsub)
              .filter((unsub) => unsub).length / campaign.row.original.mail.length)
            * 100
          ).toFixed(1) + " %"
      }
    }),
    columnHelper.accessor("status", {
      cell: (campaign) => (
        <Badge
          colorScheme={
            campaign.row.original.status === "draft"
              ? "gray"
              : campaign.row.original.status === "sent"
              ? "green"
              : "red"
          }
        >
          {campaign.row.original.status === "draft" ? "Brouillon" : "Envoyée"}
        </Badge>
      ),
      header: "Status"
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={() => editCampaign(info.row.original)}
        >
          Modifier
        </Button>
      ),
    }),
  ];

  const editCampaign = (campaign: Campaign) => {
    if (!getClients.data?.length) {
      return;
    }
    context?.setCampaign(campaign);
    onOpen();
  };

  const createCampaign = () => {
    if (!getClients.data?.length) {
      onOpenCreateCustomerModal();
      return;
    }
    context?.setCampaign(undefined);
    onOpen();
  };

  useEffect(() => {
    refetchCampaigns();
    getClients.refetch();
  }, []);

  React.useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  const closeModal = useCallback(() => {
    onClose();
    context?.setCampaign(undefined);
    refetchCampaigns();
  }, []);

  if (countCampaigns === 0 && !isLoading && !debouncedSearch)
    return (
      <Box
        pt={20}
        pb={12}
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        gap={5}
      >
        <Image alt="erreur" src="/assets/Error1.svg" width={90} height={98} />
        <Text fontSize={18} fontWeight={700}>
          Il n'y aucune campagne par ici ...
        </Text>
        <Text fontSize={13} fontWeight={400} mb={4}>
          Ajoutez une campagne pour commencer
        </Text>
        <Button onClick={countClients === 0 ? onOpenCreateCustomerModal : onOpen} colorScheme="purple">
          Ajouter des campagnes
        </Button>
        <CampaignModal isOpen={isOpen} onClose={closeModal} />
        <CreateCustomerModal
          isOpen={isCreateCustomerModalOpen}
          onClose={onCloseCreateCustomerModal}
          onOpen={onOpenCreateCustomerModal}
        />
      </Box>
    );

  return (
    <Box h="full" w="full" pt={2}>
      <Box
        w="full"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={4}
      >
        <Heading
          display="flex"
          flexDirection="row"
          gap={1}
          fontSize={18}
          fontWeight={400}
        >
          <Text fontWeight="bold">Campagnes</Text>
          <SkeletonCircle size="6" mt={0.5} isLoaded={!isRefetching} w="fit-content">
            <Text letterSpacing="widest" fontStyle="italic">
              ({countCampaigns})
            </Text>
          </SkeletonCircle>
        </Heading>
        <InputGroup>
          <Input
            placeholder="Recherche"
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputRightElement children={<SearchIcon />} />
        </InputGroup>
        <Flex>
          <Button
            onClick={createCampaign}
            colorScheme="green"
            fontSize="sm"
          >
            Créer une campagne
          </Button>
        </Flex>
      </Box>
      <br />
      <DataTable
        columns={columns}
        data={campaigns}
        countTotal={countCampaigns}
        isLoading={isLoading}
        pagination={{
          pageSize: defaultLimit,
          pageIndex,
          setPageIndex
        }}
      />
      <CampaignModal isOpen={isOpen} onClose={closeModal} />
      <CreateCustomerModal
        isOpen={isCreateCustomerModalOpen}
        onClose={onCloseCreateCustomerModal}
        onOpen={onOpenCreateCustomerModal}
      />
    </Box>
  );
};

export default DashboardCampaign;
