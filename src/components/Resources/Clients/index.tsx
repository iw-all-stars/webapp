import {
  Box,
  Button,
  CircularProgress,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { api } from "~/utils/api";
import CreateClientModal from "./CreateClientModal";

export const Clients = () => {
  const getClients = api.customer.getClients.useQuery();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    getClients.refetch();
  }, []);

  const onCreateClient = () => {
    onOpen();
  };

  if (!getClients.data?.length)
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
        <CreateClientModal isOpen={isOpen} onClose={onClose} />
      </Box>
    );

  return <></>;
};

export default Clients;
