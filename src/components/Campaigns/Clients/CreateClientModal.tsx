import { EmailIcon, PhoneIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { type Client } from "@prisma/client";
import React, { useEffect } from "react";
import { api } from "~/utils/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editClient?: Client;
}

export const CreateClientModal = ({ isOpen, onClose, editClient }: Props) => {
  const [client, setClient] = React.useState<Client | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const createClient = api.customer.createClient.useMutation();
  const updateClient = api.customer.updateClient.useMutation();

  const createOrUpdateCustomer = () => {
    if (!client || !client.email || !client.name) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setError(null);

    if (!client?.id) {
      createClient.mutate(client, {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          // [ { "code": "invalid_type", "expected": "string", "received": "undefined", "path": [ "phone" ], "message": "Required" }, { "code": "invalid_type", "expected": "string", "received": "undefined", "path": [ "image" ], "message": "Required" } ]
          const errors = error.message;
          console.log(errors);
          return;
          setError(errors);
        },
      });
      return;
    }
    updateClient.mutate(client, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.log(error);
        return;
        setError(error.message);
      },
    });
  };

  useEffect(() => {
    if (editClient) {
      return setClient(editClient);
    }
    setClient(null);
  }, [editClient]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader noOfLines={2}>
          {client?.id ? "Modifier un client" : "Ajouter un client"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={8}>
          {error && (
            <Box
              mb={4}
              p={2}
              borderRadius={4}
              border="1px solid"
              borderColor="red.500"
              color="red.500"
            >
              {error}
            </Box>
          )}
          <Box
            w="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            gap={5}
          >
            <Flex w="100%" justifyContent="space-between" gap="4">
              <FormControl>
                <FormLabel>Prénom</FormLabel>
                <Input
                  placeholder="Juste"
                  value={client?.firstname || ""}
                  onChange={(e) => {
                    const firstname = e.target.value;
                    setClient({ ...client, firstname });
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nom</FormLabel>
                <Input
                  placeholder="Leblanc"
                  value={client?.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setClient({ ...client, name });
                  }}
                />
                <FormErrorMessage>Le nom est obligatoire</FormErrorMessage>
              </FormControl>
            </Flex>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Email"
                  value={client?.email || ""}
                  onChange={(e) => {
                    const email = e.target.value;
                    setClient({ ...client, email });
                  }}
                />
              </InputGroup>
              <FormErrorMessage>L'email est obligatoire</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Numéro de téléphone</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <PhoneIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={client?.phone || ""}
                  onChange={(e) => {
                    const phone = e.target.value;
                    setClient({ ...client, phone });
                  }}
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Adresse</FormLabel>
              <Input
                placeholder="Adresse"
                value={client?.address || ""}
                onChange={(e) => {
                  const address = e.target.value;
                  setClient({ ...client, address });
                }}
              />
            </FormControl>
            <Flex w="100%" justifyContent="space-between" gap="4">
              <FormControl>
                <FormLabel>Ville</FormLabel>
                <Input
                  placeholder="Ville"
                  value={client?.city || ""}
                  onChange={(e) => {
                    const city = e.target.value;
                    setClient({ ...client, city });
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Code postal</FormLabel>
                <Input
                  placeholder="Code postal"
                  value={client?.zip || ""}
                  onChange={(e) => {
                    const zip = e.target.value;
                    setClient({ ...client, zip });
                  }}
                />
              </FormControl>
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
        >
          <Button onClick={onClose} mr={3}>
            Annuler
          </Button>
          <Button colorScheme={"purple"} onClick={createOrUpdateCustomer}>
            {client?.id ? "Modifier" : "Ajouter"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateClientModal;
