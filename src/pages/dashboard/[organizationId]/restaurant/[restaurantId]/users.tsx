import { Button, Heading, Flex, Divider, Avatar, Text, Skeleton, Center } from "@chakra-ui/react";
import { type GetServerSideProps, type NextPage } from "next";
import { Box } from "@chakra-ui/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Fragment, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Select as ReactSelect } from "chakra-react-select";
import { hasAccessToRestaurant } from "~/utils/hasAccessToRestaurantServerSideProps";

export const getServerSideProps: GetServerSideProps = async (context) => {
    return hasAccessToRestaurant(context);
};

const DashboardInvitations: NextPage = () => {

  const utils = api.useContext();
  const router = useRouter();
  const { organizationId } = router.query;

  const [usersToInvite, setUsersToInvite] = useState<string[]>([]);

  const { data: session } = useSession();

  // mouais
  const { data: users } = api.user.getAll.useQuery();
  const { data: invitations, isLoading: isLoadingInvitations } = api.invitation.getByOrganizationId.useQuery({
    organizationId: organizationId as string
  }, { enabled: !!organizationId });

  const isAdmin = useMemo(() => (
    users?.find(user => user.id === session?.user.id)?.organizations
      .find(organization => organization.organizationId === organizationId as string)?.role === "ADMIN"
  ), [users, session, organizationId]);

  const usersFromOrganization = useMemo(() => (
    users?.filter(user => user.organizations.some(organization => organization.organizationId === organizationId as string))
      .map(user => {
        const organization = user.organizations.find(organization => organization.organizationId === organizationId as string);
        return {
          ...user,
          role: organization?.role,
        }
      })
      .sort((a, b) => {
        if (a.role === "ADMIN") return -1;
        if (b.role === "ADMIN") return 1;
        return 0;
      }) ?? []
  ), [users, organizationId]);

  const usersNotInOrganizationOptions = useMemo(() => (
    users?.filter(user => !user.organizations.some(organization => organization.organizationId === organizationId as string))
      .filter(user => !invitations?.some(invitation => invitation.receiverId === user.id))
      .map(user => ({
        value: user.id,
        label: user.email,
      })) ?? []
  ), [users, organizationId, invitations]);

  const addInvitation = api.invitation.add.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate()
      utils.invitation.getByOrganizationId.invalidate({ organizationId: organizationId as string })
    }
  })

  const removeUserFromOrganization = api.organization.removeUser.useMutation({
    onSuccess: () => utils.user.getAll.invalidate()
  });

  const deleteInvitation = api.invitation.delete.useMutation({
    onSuccess: () => utils.invitation.getByOrganizationId.invalidate({ organizationId: organizationId as string })
  })

  const handleAddInvitation = async () => {
    if (usersToInvite.length === 0) return;

    await addInvitation.mutateAsync({
      receiverIds: usersToInvite,
      organizationId: organizationId as string,
    })

    setUsersToInvite([]);
  }

  const handleRemoveUserFromOrganization = (userId: string) => {
    removeUserFromOrganization.mutate({
      id: organizationId as string,
      userId,
    });
  }

  const handleRemoveInvitation = (invitationId: string) => {
    deleteInvitation.mutate({
      id: invitationId,
      organizationId: organizationId as string,
    })
  }

  return (
    <Box py={8}>
      <Heading mb={5}>Utilisateurs</Heading>
      <Flex direction="column" bg="white" rounded="lg" border="1px solid" borderColor="gray.400">
        {isAdmin && (
          <Flex alignItems="center" py={6} px={4}>
            <ReactSelect
              isMulti
              options={usersNotInOrganizationOptions}
              value={usersNotInOrganizationOptions.filter(user => usersToInvite.includes(user.value))}
              onChange={users => setUsersToInvite(users.map(user => user.value))}
              placeholder="Inviter un utilisateur"
              noOptionsMessage={() => "Aucun utilisateurs"}
              chakraStyles={{
                container: (styles) => ({
                  ...styles,
                  width: "100%",
                }),
                dropdownIndicator: () => ({
                  display: "none",
                }),
              }}
            />
            <Button ml={4} colorScheme="blue" onClick={() => handleAddInvitation()}>Inviter</Button>
          </Flex>
        )}
        {!usersFromOrganization.length ? (
          <Skeleton height="192px" />
        ) : 
          usersFromOrganization?.map((user, index) => (
            <Fragment key={user.id}>
              {index === 0 && isAdmin && <Divider borderColor="gray.400" />}
              <Flex alignItems="center" justifyContent="space-between" py={6} px={4}>
                <Flex alignItems="center">
                  <Avatar src={user.image ?? undefined} name={user.name ?? undefined} mr={4} />
                  <Flex direction="column">
                    <Text>{user.name}</Text>
                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                  </Flex>
                </Flex>
                <Flex alignItems="center" gap={6}>
                  <Text textColor="gray.500">
                    {user.role === "ADMIN" ? "Administrateur" : "Membre"}
                  </Text>
                  {isAdmin && user.id !== session?.user.id && (
                    <Button colorScheme="red" onClick={() => handleRemoveUserFromOrganization(user.id)}>Supprimer</Button>
                  )}
                </Flex>
              </Flex>
              {index !== usersFromOrganization.length - 1 && <Divider borderColor="gray.400" />}
            </Fragment>
          ))
        }
      </Flex>
      {isAdmin && (
        <>
          <Heading mt={6} mb={5}>Invitations en attente</Heading>
          <Flex direction="column" bg="white" rounded="lg" border="1px solid" borderColor="gray.400">
            <Flex alignItems="center" py={6} px={4}>
              {isLoadingInvitations ? (
                <Skeleton height="96px" />
              ) :
                invitations?.length === 0 ? (
                  <Center w="full" h="96px">Aucune invitation en attente</Center>
                ) : (
                  invitations?.map((invitation, index) => (
                    <Fragment key={invitation.id}>
                      <Flex w="full" alignItems="center" justifyContent="space-between">
                        <Flex alignItems="center">
                          <Avatar src={invitation.receiver.image ?? undefined} name={invitation.receiver.name ?? undefined} mr={4} />
                          <Flex direction="column">
                            <Text>{invitation.receiver.name}</Text>
                            <Text fontSize="sm" color="gray.500">{invitation.receiver.email}</Text>
                          </Flex>
                        </Flex>
                        <Button colorScheme="red" onClick={() => handleRemoveInvitation(invitation.id)}>Annuler l'invitation</Button>
                      </Flex>
                      {index !== invitations.length - 1 && <Divider borderColor="gray.400" />}
                    </Fragment>
                  )
                ))
              }
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default DashboardInvitations;
