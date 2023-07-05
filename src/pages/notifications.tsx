import {
    Avatar,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Center,
    Flex,
    Heading,
    Skeleton,
    SkeletonCircle,
    Text,
	useToast,
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { type Invitation } from "@prisma/client";
import { useRouter } from "next/router";
import { NoDataFound } from "~/components/NoDataFound";

const Home: NextPage = () => {
    const router = useRouter();

	const toast = useToast();

    const utils = api.useContext();

    const { data: invitations, isLoading } =
        api.invitation.getByCurrentUser.useQuery();

    const changeStatusInvitation = api.invitation.changeStatus.useMutation({
        onSuccess: () => {
            utils.invitation.getByCurrentUser.invalidate();
            utils.invitation.getByCurrentUserCount.invalidate();
			toast({
				title: "Invitation acceptée.",
				description: "Vous avez bien rejoint l'organisation.",
				status: "success",
				duration: 5000,
				isClosable: true,
			  });
        },
    });

    const handleStateInvitation = async (
        invitation: Invitation,
        status: "ACCEPTED" | "REJECTED"
    ) => {
        await changeStatusInvitation.mutateAsync({
            invitationId: invitation.id,
            organizationId: invitation.organizationId,
            status,
        });
    };

    return (
            <Box h="full" w="full" pt={8}>
                <Heading>Notifications en attentes</Heading>
                {!isLoading ? (
                    invitations?.length ?? 0 > 0 ? (
                        <Box display="flex" flexWrap="wrap" gap="4" my={4}>
                            {invitations?.map((invitation) => (
                                <Card key={invitation.id} width="300px">
                                    <CardBody>
                                        <Center flexDirection="column">
                                            <Avatar
                                                h={10}
                                                w={10}
                                                rounded="full"
                                                src={
                                                    invitation.sender.image ??
                                                    undefined
                                                }
                                                name={
                                                    invitation.sender.name ??
                                                    undefined
                                                }
                                            />
                                            <Text align="center" mt={2}>
                                                <Text as="b">
                                                    {invitation.sender.name}
                                                </Text>
                                                <br />
                                                vous a envoyé une invitation
                                                pour rejoindre l'organisation
                                                <br />
                                                <Text as="b">
                                                    {
                                                        invitation.organization
                                                            .name
                                                    }
                                                </Text>
                                            </Text>
                                        </Center>
                                    </CardBody>
                                    <CardFooter
                                        justifyContent="center"
                                        pt={0}
                                        gap={4}
                                    >
                                        <Button
                                            colorScheme="red"
                                            onClick={() =>
                                                handleStateInvitation(
                                                    invitation,
                                                    "REJECTED"
                                                )
                                            }
                                        >
                                            Refuser
                                        </Button>
                                        <Button
                                            colorScheme="green"
                                            onClick={() =>
                                                handleStateInvitation(
                                                    invitation,
                                                    "ACCEPTED"
                                                )
                                            }
                                        >
                                            Accepter
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Center h="75%">
                            <NoDataFound
                                text="Pas de notifications en attentes"
                                button={
                                    <Button
                                        onClick={() => router.push("/")}
                                        colorScheme="teal"
                                    >
                                        Retourner à l'accueil
                                    </Button>
                                }
                            />
                        </Center>
                    )
                ) : (
                    <Box display="flex" gap={4}>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Box
                                key={i}
                                bg="gray.100"
                                height="244px"
                                width="294px"
                                marginTop="4"
                                borderRadius="md"
                                display="flex"
                                flexDirection="column"
                            >
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    margin="5"
                                >
                                    <SkeletonCircle
                                        startColor="gree.100"
                                        size="10"
                                    />
                                </Box>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    gap="4"
                                    alignItems="center"
                                    flex="1"
                                    bg="gray.100"
                                >
                                    <Skeleton height="10px" width="150px" />
                                    <Skeleton height="10px" width="100px" />
                                    <Flex gap="4">
                                        <Skeleton
                                            height="30px"
                                            width="80px"
                                            borderRadius="8px"
                                        />
                                        <Skeleton
                                            height="30px"
                                            width="80px"
                                            borderRadius="8px"
                                        />
                                    </Flex>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
    );
};

export default Home;
