import React, { useContext, useEffect } from "react";
import {
  Box,
  Input,
  InputGroup,
  Flex,
  Text,
  Switch,
  Heading,
  SkeletonCircle,
  InputRightElement,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { RxPaperPlane } from "react-icons/rx";
import { DataTable } from "~/components/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { type Client } from "@prisma/client";
import { api } from "~/utils/api";
import { useDebounce } from "usehooks-ts";
import { CampaignContext } from "../../CampaignContext";

interface RecipientStepProps {
  isCampaignSent: boolean;
  selectAllRecipients: boolean;
  setSelectAllRecipients: (selectAllRecipients: boolean) => void;
  excludeClients: string[];
  setExcludeClients: (excludeClients: string[]) => void;
  includeClients: string[];
  setIncludeClients: (includeClients: string[]) => void;
}

export const RecipientStep = ({
  isCampaignSent,
  selectAllRecipients,
  setSelectAllRecipients,
  excludeClients,
  setExcludeClients,
  includeClients,
  setIncludeClients,
}: RecipientStepProps) => {
  const [search, setSearch] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const context = useContext(CampaignContext);

  const { data: countClients, refetch: refetchCountClients } =
    api.customer.getCountClients.useQuery({
      search: debouncedSearch,
      campaignId: context?.campaign?.id,
    }, {
      initialData: 0,
    });

  const { data, isLoading, refetch, isRefetching } =
    api.customer.getClients.useQuery({
      input: debouncedSearch,
      limit: 10,
      offset: pageIndex * 10,
      campaignId: context?.campaign?.id,
    });

  const columnHelper = createColumnHelper<Client>();

  const columns = [
    columnHelper.accessor("firstname", {
      cell: (info) => info.getValue(),
      header: "Prénom",
    }),
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Nom",
    }),
    columnHelper.accessor("email", {
      cell: (info) => info.getValue(),
      header: "Email",
    }),
    columnHelper.display({
      id: "select",
      header: isCampaignSent
        ? `Envoyé${selectAllRecipients ? "s" : ""} à ${countClients} clients`
        : "Sélectionner",
      cell: (info) =>
        isCampaignSent ? (
          <Icon as={RxPaperPlane} color="green.400" />
        ) : (
          <Switch
            size="sm"
            colorScheme="blue"
            isChecked={
              selectAllRecipients
                ? !excludeClients.includes(info.row.original.id)
                : includeClients.includes(info.row.original.id)
            }
            onChange={(e) => {
              const clientId = info.row.original.id;

              if (selectAllRecipients) {
                if (!e.target.checked) {
                  if (!excludeClients.includes(clientId)) {
                    setExcludeClients([...excludeClients, clientId]);
                  }
                  setIncludeClients(
                    includeClients.filter((id: string) => id !== clientId)
                  );
                } else {
                  setExcludeClients(
                    excludeClients.filter((id: string) => id !== clientId)
                  );
                }
              } else {
                if (e.target.checked) {
                  if (!includeClients.includes(clientId)) {
                    setIncludeClients([...includeClients, clientId]);
                  }
                  setExcludeClients(
                    excludeClients.filter((id: string) => id !== clientId)
                  );
                } else {
                  setIncludeClients(
                    includeClients.filter((id: string) => id !== clientId)
                  );
                }
              }
            }}
          />
        ),
    }),
  ];

  useEffect(() => {
    setIncludeClients([]);
    setExcludeClients([]);
  }, [selectAllRecipients]);

  return (
    <Box>
      {!isCampaignSent && (
        <Box w="full" display="flex" alignItems="center" gap={4}>
          <Heading
            display="flex"
            alignItems="center"
            gap={1}
            fontSize={18}
            fontWeight={400}
            alignContent={"center"}
          >
            <Text fontWeight="bold">Clients</Text>
            <SkeletonCircle
              size="6"
              mt={0.5}
              isLoaded={!isRefetching}
              w="fit-content"
            >
              <Text letterSpacing="widest" fontStyle="italic">
                ({countClients})
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
          <Flex
            flexDirection={"column"}
            alignItems={"center"}
            textAlign={"center"}
            gap={1}
          >
            <Switch
              size="md"
              colorScheme="blue"
              isChecked={selectAllRecipients}
              onChange={(e) => {
                setSelectAllRecipients(e.target.checked);
                setIncludeClients([]);
                setExcludeClients([]);
              }}
            />
            <Text fontSize={12}>Tous</Text>
          </Flex>
          <Divider orientation="vertical" />
          <Flex
            flexDirection={"column"}
            alignItems={"center"}
            textAlign={"center"}
          >
            <Text fontSize={16}>
              {selectAllRecipients
                ? countClients - excludeClients.length
                : includeClients.length}
            </Text>
            <Text fontSize={12}>Séléctionnés</Text>
          </Flex>
        </Box>
      )}
      <br />
      <Box border="1px" borderColor="#EDF2F7" py={4} borderRadius="0.375rem">
        <DataTable
          columns={columns}
          data={data}
          countTotal={countClients}
          isLoading={isLoading}
          pagination={{
            pageSize: 10,
            pageIndex,
            setPageIndex,
          }}
        />
      </Box>
    </Box>
  );
};

export default RecipientStep;
