import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SkeletonCircle,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { api } from "~/utils/api";
import CreateClientModal from "./CreateClientModal";
import { SearchIcon } from "@chakra-ui/icons";
import { type Client } from "@prisma/client";
import { useDebounce } from "usehooks-ts";
import ImportClientModal from "./ImportClientModal";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "~/components/DataTable";

const defaultLimit = 5;

export const Clients = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();
  const [editClient, setEditClient] = React.useState<Client | undefined>(
    undefined
  );
  const [search, setSearch] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const { data: countClients, refetch: refetchCountClients } =
    api.customer.getCountClients.useQuery(
      {
        search: debouncedSearch,
      },
      {
        initialData: 0,
      }
    );

  const { data, isLoading, refetch, isRefetching } =
    api.customer.getClients.useQuery({
      input: debouncedSearch,
      limit: defaultLimit,
      offset: pageIndex * defaultLimit,
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
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={() => handleEditClient(info.row.original)}
        >
          Modifier
        </Button>
      ),
    }),
  ];

  const onCreateClient = () => {
    setEditClient(undefined);
    onOpen();
  };

  const handleEditClient = (client: Client) => {
    setEditClient(client);
    onOpen();
  };

  const onImportClient = () => {
    onImportOpen();
  };

  React.useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (!isOpen && !isImportOpen) {
      refetch();
      refetchCountClients();
      setSearch("");
    }
  }, [isOpen, isImportOpen]);

  if (countClients === 0 && !isLoading && !debouncedSearch)
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
          Il n'y aucun client par ici ...
        </Text>
        <Text fontSize={13} fontWeight={400} mb={4}>
          Ajoutez une liste de client pour pouvoir les contacter facilement lors
          de la création d’une campagne
        </Text>
        <Menu>
          <MenuButton colorScheme="purple" as={Button}>
            Ajouter des clients
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onCreateClient}>Manuellement</MenuItem>
            <MenuItem onClick={onImportClient}>
              Importer un fichier (XSLX)
            </MenuItem>
          </MenuList>
        </Menu>
        <CreateClientModal
          isOpen={isOpen}
          onClose={onClose}
          editClient={editClient}
        />
        <ImportClientModal isOpen={isImportOpen} onClose={onImportClose} />
      </Box>
    );

  return (
    <Box h="full" w="full" pt={2}>
      <Box w="full" display="flex" alignItems="center" gap={4}>
        <Heading
          display="flex"
          alignItems="center"
          gap={1}
          fontSize={18}
          fontWeight={400}
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
        <Flex gap={4}>
          <Button onClick={onCreateClient} colorScheme="green" fontSize="sm">
            Ajouter un client
          </Button>
          <Button onClick={onImportClient} colorScheme="blue" fontSize="sm">
            Importer des clients (XSLX)
          </Button>
        </Flex>
      </Box>
      <br />
      <DataTable
        columns={columns}
        data={data}
        countTotal={countClients}
        isLoading={isLoading}
        pagination={{
          pageSize: defaultLimit,
          pageIndex,
          setPageIndex,
        }}
      />
      <CreateClientModal
        isOpen={isOpen}
        onClose={onClose}
        editClient={editClient}
      />
      <ImportClientModal isOpen={isImportOpen} onClose={onImportClose} />
    </Box>
  );
};

export default Clients;
