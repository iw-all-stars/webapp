import React, { useRef, useState } from "react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { Button, Flex, Skeleton, SkeletonCircle, Text, Image, Box, Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, ModalFooter, useDisclosure } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { set } from "zod";

const Home: NextPage = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = useRef<HTMLInputElement | undefined>(undefined);
  const [newOrganizationName, setNewOrganizationName] = useState<string | undefined>(undefined);

  const router = useRouter();
  const utils = api.useContext();

  const { data: session, status: sessionStatus } = useSession();

  const organizations = api.organization.getByUserId.useQuery();

  const addOrganization = api.organization.add.useMutation({
    onSuccess: () => {
      utils.organization.getByUserId.invalidate();
    },
  });

  const handleOrganization = () => {
    if (session && newOrganizationName) {
      addOrganization.mutate({
        name: newOrganizationName,
        userId: session.user.id,
      });
      onClose();
      setNewOrganizationName(undefined);
    }
  };

  return (
    <>
      <Box h="full" w="full" pt={8}>
        {organizations.data && (
          organizations.data?.length ? (
            <>
              <Flex justifyContent="space-between">
                <Flex alignItems="center" gap={4}>
                  <SkeletonCircle h={10} w={10} rounded="full" isLoaded={sessionStatus !== "loading"}>
                    <Image h={10} w={10} rounded="full" src={session?.user?.image ?? ""} alt="User profile image" />
                  </SkeletonCircle>
                  <Skeleton isLoaded={sessionStatus !== "loading"} h={6}>
                    <Text minW={28}>{session?.user.name}</Text>
                  </Skeleton>
                </Flex>
                <Button onClick={onOpen}>Créer une organisation</Button>
              </Flex>
              <Grid templateColumns="repeat(3, 1fr)" gap={12} mt={8}>
                {organizations.data?.map((organization) => (
                  <GridItem key={organization.id} px={7} py={4} borderRadius={6} minH={32} bg="gray.50" cursor="pointer" _hover={{ bg: "gray.100" }} onClick={() => router.push(`/dashboard/${organization.id}`)}>
                    <Text fontSize="2xl" fontWeight="bold">{organization.name}</Text>
                  </GridItem>
                ))}
              </Grid>
            </>
          ) : (
            <Flex direction="column" gap={3}>
              <p>Vous n'avez pas encore d'organisations...</p>
              <Button onClick={onOpen}>Créer une organisation</Button>
            </Flex>
          )
        )}
      </Box>
      <Modal
        initialFocusRef={initialRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Créer votre organisation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Nom de votre organisation</FormLabel>
              <Input onChange={(e) => setNewOrganizationName(e.target.value)} ref={initialRef} placeholder='Nom' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={() => handleOrganization()}>
              Valider
            </Button>
            <Button onClick={onClose}>Annuler</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
