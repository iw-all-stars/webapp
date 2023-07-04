import { EmailIcon } from "@chakra-ui/icons";
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
  useToast,
} from "@chakra-ui/react";
import { type Client } from "@prisma/client";
import React, { useEffect } from "react";
import { api } from "~/utils/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editClient?: Client;
}

interface ErrorResponse {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}

type ClientSchema = {
  id?: string;
  email: string;
  name: string;
  firstname?: string;
  phone?: string;
  image?: string;
  address?: string;
  city?: string;
  zip?: string;
};

export const CreateClientModal = ({ isOpen, onClose, editClient }: Props) => {
  const [client, setClient] = React.useState<Partial<Client> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();

  const createClient = api.customer.createClient.useMutation();
  const updateClient = api.customer.updateClient.useMutation();
  const deleteClient = api.customer.deleteClient.useMutation();

  const parseJSON = (response: string) => {
    try {
      return JSON.parse(response) as ErrorResponse[];
    } catch (error) {
      return response;
    }
  };

  function setApiError(response: string): string {
    const responseError = parseJSON(response);

    if (typeof responseError === "string") {
      return responseError;
    }

    const fieldNames = {
      email: "email",
      phone: "numéro de téléphone",
      name: "nom",
      firstname: "prénom",
      address: "adresse",
      zip: "code postal",
      city: "ville",
    };

    const errorMessages = responseError.map((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fieldName = fieldNames[error.path[0] as keyof typeof fieldNames];
      return `${fieldName}`;
    });
    return `Les champs suivants sont invalides : (${errorMessages.join(
      ") ("
    )})`;
  }

  const createOrUpdateCustomer = () => {
    if (!client || !client.email || !client.name) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setError(null);

    if (!client?.id) {
      return createClient.mutate(client as ClientSchema, {
        onSuccess: () => {
          onClose();
          toast({
            title: "Client créé",
            description: "Le client a été créé avec succès.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        },
        onError: (error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setError(setApiError(error.message));
        },
      });
    }
    updateClient.mutate(client as ClientSchema, {
      onSuccess: () => {
        onClose();
        toast({
          title: "Client modifié",
          description: "Le client a été modifié avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setError(setApiError(error.message));
      },
    });
  };

  const removeClient = () => {
    if (!client?.id) {
      return;
    }
    deleteClient.mutate(client.id, {
      onSuccess: () => {
        onClose();
        toast({
          title: "Client supprimé",
          description: "Le client a été supprimé avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setError(setApiError(error.message));
      },
    });
  };

  useEffect(() => {
    if (editClient) {
      return setClient(editClient);
    }
    setClient(null);
  }, [editClient]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setClient(null);
    }
  }, [isOpen]);

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
                isInvalid={!!error?.includes("prénom")}
                  placeholder="Juste"
                  value={client?.firstname || ""}
                  onChange={(e) => {
                    const firstname = e.target.value;
                    setClient({ ...client, firstname });
                  }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nom</FormLabel>
                <Input
                  isInvalid={!!error?.includes("(nom)")}
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
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  isInvalid={!!error?.includes("email")}
                  type="email"
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
          </Box>
        </ModalBody>
        <ModalFooter display="flex" justifyContent="space-between" gap={4}>
          {client?.id ? (
            <Button
              colorScheme={"red"}
              onClick={removeClient}
              isLoading={deleteClient.isLoading}
            >
              Supprimer
            </Button>
          ) : (
            <div></div>
          )}
          <Flex gap={4} align="right">
            <Button onClick={onClose}>Annuler</Button>
            <Button
              colorScheme={"purple"}
              onClick={createOrUpdateCustomer}
              isLoading={createClient.isLoading || updateClient.isLoading}
            >
              {client?.id ? "Modifier" : "Ajouter"}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateClientModal;
