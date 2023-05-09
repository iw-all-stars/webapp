import React from "react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { Button, Center, Flex, Skeleton, SkeletonCircle, Text, Image, Box, Grid, GridItem } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {

  const utils = api.useContext();

  const { data: session, status: sessionStatus } = useSession();

  const organizations = api.organization.getByUserId.useQuery();

  const addOrganization = api.organization.add.useMutation({
    onSuccess: () => {
      utils.organization.getByUserId.invalidate();
    },
  });

  const handleOrganization = () => {
    if (session) {
      addOrganization.mutate({
        name: "Example",
        userId: session.user.id,
      });
    }
  };

  return (
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
            </Flex>
            <Grid templateColumns="repeat(3, 1fr)" gap={12} mt={8}>
              {organizations.data?.map((organization) => (
                <GridItem key={organization.id} px={7} py={4} borderRadius={10} minH={32} textColor="white" bg="gray.400">
                  <Text fontSize="2xl" fontWeight="bold">{organization.name}</Text>
                </GridItem>
              ))}
            </Grid>
          </>
        ) : (
          <Flex direction="column" gap={3}>
            <p>Vous n'avez pas encore d'organisations...</p>
            <Button onClick={() => handleOrganization()}>Créer une organisation</Button>
          </Flex>
        )
      )}
    </Box>
  );
};

export default Home;
