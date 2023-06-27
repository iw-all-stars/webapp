import {
  Box,
  Button,
  Card, CardBody,
  CardFooter,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton, SkeletonCircle, Text,
  useDisclosure
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { Invitation } from "@prisma/client";

type InvitationFormValues = {
  organizationId: string;
  receiverId: string;
};

const Home: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, formState: { errors }, handleSubmit, reset } = useForm<InvitationFormValues>();

  const router = useRouter();
  const utils = api.useContext();

  const { data: session, status: sessionStatus } = useSession();
  
  const { data: users } = api.user.getAll.useQuery();
  const { data: organizations } = api.organization.getByCurrentUser.useQuery();
  const { data: invitations } = api.invitation.getByCurrentUser.useQuery();

  const addInvitation = api.invitation.add.useMutation({
    onSuccess: () => utils.invitation.getByCurrentUser.invalidate()
  })

  const changeStatusInvitation = api.invitation.changeStatus.useMutation({
    onSuccess: () => utils.invitation.getByCurrentUser.invalidate()
  })

  const handleAddInvitation: SubmitHandler<InvitationFormValues> = async (invitationForm) => {
    if (session) {
      await addInvitation.mutateAsync({
        ...invitationForm,
        senderId: session.user.id,
      });
      onClose();
    }
  }

  const handleStateInvitation = async (invitation: Invitation, status: 'ACCEPTED' | 'REJECTED') => {
    await changeStatusInvitation.mutateAsync({
      invitationId: invitation.id,
      organizationId: invitation.organizationId,
      status
    })
  }

  const filterUsers = useMemo(() => (
    users?.filter(user => user.id !== session?.user.id)
  ), [users]);

  return (
    <>
      <Box h="full" w="full" pt={8}>
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap={4}>
            <SkeletonCircle h={10} w={10} rounded="full" isLoaded={sessionStatus !== "loading"}>
              <Image h={10} w={10} rounded="full" src={session?.user?.image ?? ""} alt="User profile image" />
            </SkeletonCircle>
            <Skeleton isLoaded={sessionStatus !== "loading"} h={6}>
              <Text minW={28}>{session?.user.name}</Text>
            </Skeleton>
          </Flex>
          <Button onClick={onOpen}>Créer une invitation</Button>
        </Flex>
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4} mt={8}>
          {invitations?.map((invitation) => (
            <GridItem key={invitation.id} w="full">
              <Card w="full" mx="auto">
                <CardBody>
                  <Text>Organisation : {invitation.organization.name}</Text>
                  <Text>Envoyeur : {invitation.sender.name}</Text>
                  <Text>Destinataire : {invitation.receiver.name}</Text>
                  <Text>Status : {invitation.status}</Text>
                </CardBody>
                {invitation.status === "PENDING" && invitation.receiverId === session?.user.id && (
                  <CardFooter justifyContent="end" gap={4}>
                    <Button colorScheme="red" onClick={() => handleStateInvitation(invitation, "REJECTED")}>Refuser</Button>
                    <Button colorScheme="green" onClick={() => handleStateInvitation(invitation, "ACCEPTED")}>Accepter</Button>
                  </CardFooter>
                )}
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} onCloseComplete={() => reset()}>
        <ModalOverlay />
        <ModalContent zIndex={0}>
          <form onSubmit={handleSubmit(handleAddInvitation)}>
            <ModalHeader>Nouvelle invitation</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl mt={4} isInvalid={!!errors.organizationId}>
                <FormLabel>Organisation</FormLabel>
                <Select {...register("organizationId", { required: true })} placeholder="Choissisez une organisation">
                  {organizations?.map((organization) => (
                    <option key={organization.id} value={organization.id}>{organization.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4} isInvalid={!!errors.receiverId}>
                <FormLabel>Destinataire</FormLabel>
                <Select {...register("receiverId", { required: true })} placeholder="Choissisez le destinataire">
                  {filterUsers?.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} type="submit">
                Valider
              </Button>
              <Button onClick={onClose}>Annuler</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
