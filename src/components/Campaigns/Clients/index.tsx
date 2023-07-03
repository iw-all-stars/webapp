import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { api } from "~/utils/api";
import CreateClientModal from "./CreateClientModal";
import { SearchIcon } from "@chakra-ui/icons";
import { type Client } from "@prisma/client";
import ImportClientModal from "./ImportClientModal";

export const Clients = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  const [editClient, setEditClient] = React.useState<Client | undefined>(
    undefined
  );
  const [search, setSearch] = React.useState("");

  const getClients = api.customer.getClients.useQuery(search);

  useEffect(() => {
    getClients.refetch();
  }, [isOpen]);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      getClients.refetch();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [search]);

  if (!getClients.data?.length && !search)
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
          "- Il s'appelle Juste Leblanc. – Ah bon, il n'a pas de prénom ? ...”
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
            <MenuItem>Importer un fichier</MenuItem>
          </MenuList>
        </Menu>
        <CreateClientModal
          isOpen={isOpen}
          onClose={onClose}
          editClient={editClient}
        />
      </Box>
    );

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
          <b>Clients</b>
          <Text letterSpacing={"widest"} fontStyle={"italic"}>
            ({getClients.data?.length})
          </Text>
        </Heading>
        <InputGroup>
          <Input placeholder="Recherche" onChange={(e) => setSearch(e.target.value)} />
          <InputRightElement children={<SearchIcon />} />
        </InputGroup>
        <Button
          onClick={onCreateClient}
          fontSize={12}
          colorScheme="green"
          variant="solid"
          minW={"min-content"}
        >
          Ajouter un client
        </Button>
        <Button
          onClick={onImportClient}
          fontSize={12}
          colorScheme="blue"
          variant="solid"
          minW={"min-content"}
        >
          Importer des clients (XSLX)
        </Button>
      </Box>
      <br />
      <TableContainer>
        <Table variant="striped" size="md" fontSize={13}>
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Prénom</Th>
              <Th>Nom</Th>
              <Th>Email</Th>
            </Tr>
          </Thead>
          <Tbody>
            {getClients?.data?.map((client) => (
              <Tr
                key={client.id}
                onClick={() => handleEditClient(client)}
                cursor={"pointer"}
              >
                <Td>
                  <Image
                    borderRadius="full"
                    boxSize="30px"
                    src={client.image || "https://i.pravatar.cc/150?img=68"}
                    alt={client.name || "image"}
                  />
                </Td>
                <Td>{client.firstname}</Td>
                <Td>{client.name}</Td>
                <Td>{client.email}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
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
