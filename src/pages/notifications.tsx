import {
  Avatar,
  Box,
  Button,
  Card, CardBody,
  CardFooter,
  Center,
  Grid,
  GridItem,
  Heading,
  Text
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { type Invitation } from "@prisma/client";

const Home: NextPage = () => {
  const utils = api.useContext();

  const { data: invitations } = api.invitation.getByCurrentUser.useQuery();

  const changeStatusInvitation = api.invitation.changeStatus.useMutation({
    onSuccess: () => {
		utils.invitation.getByCurrentUser.invalidate();
		utils.invitation.getByCurrentUserCount.invalidate();
	}
  })

  const handleStateInvitation = async (invitation: Invitation, status: 'ACCEPTED' | 'REJECTED') => {
    await changeStatusInvitation.mutateAsync({
      invitationId: invitation.id,
      organizationId: invitation.organizationId,
      status
    })
  }

  return (
    <>
      <Box h="full" w="full" pt={8}>
        <Heading>Notifications en attentes</Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4} mt={8}>
          {invitations?.map((invitation) => (
            <GridItem key={invitation.id} w="full">
              <Card w="full" mx="auto">
                <CardBody>
                  <Center flexDirection="column">
                    <Avatar h={10} w={10} rounded="full" src={invitation.sender.image ?? undefined} name={invitation.sender.name ?? undefined} />
                    <Text align="center" mt={2}>
                      <Text as='b'>{invitation.sender.name}</Text>
                      <br/>
                      vous a envoyé une invitation pour rejoindre l'organisation
                      <br/>
                      <Text as='b'>{invitation.organization.name}</Text>
                    </Text>
                  </Center>
                </CardBody>
                <CardFooter justifyContent="center" pt={0} gap={4}>
                  <Button colorScheme="red" onClick={() => handleStateInvitation(invitation, "REJECTED")}>Refuser</Button>
                  <Button colorScheme="green" onClick={() => handleStateInvitation(invitation, "ACCEPTED")}>Accepter</Button>
                </CardFooter>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default Home;
