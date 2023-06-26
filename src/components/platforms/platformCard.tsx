import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Avatar,
    Box,
    Button,
    Divider,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { type Platform, type PlatformKey } from "@prisma/client";
import { BsFillCheckCircleFill, BsThreeDotsVertical } from "react-icons/bs";
import { MdDelete, MdOutlineModeEditOutline } from "react-icons/md";
import CreateUpdatePlatform from "./createUpdatePlatform";
import { useRef } from "react";
import { type createUpdatePlatformParams } from "~/pages/dashboard/[organizationId]/restaurant/[restaurantId]/platforms";
import { api } from "~/utils/api";

interface PlatformCardProps {
    platform?: Platform;
    platformKey: PlatformKey;
    available: boolean;
    createUpdatePlatform: (data: createUpdatePlatformParams) => void;
    isLoadingCreateUpdatePlatform: boolean;
    isLoading: boolean;
}

export const PlatformCard = ({
    platformKey,
    platform,
    available,
    createUpdatePlatform,
    isLoadingCreateUpdatePlatform,
    isLoading,
}: PlatformCardProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isOpenAlert,
        onOpen: onOpenAlert,
        onClose: onCloseAlert,
    } = useDisclosure();
    const cancelRef = useRef<HTMLInputElement>(null);

	const utils = api.useContext();

	const {mutate: mutateDeletePlatform, isLoading: isLoadingDeletePlatform} = api.platform.deleteById.useMutation({
        onSuccess: () => {
			onCloseAlert();
            utils.platform.getAllByRestaurantId.invalidate();
        },
    });

    const renderBottom = (available: boolean, platform?: Platform) => {
        if (platform) {
            return (
                <Skeleton isLoaded={!isLoading}>
                    <Box
                        margin="4px 0"
                        display="flex"
                        gap="3"
                        alignItems="center"
                    >
                        <Icon as={BsFillCheckCircleFill} color="green.400" />
                        <Text fontSize="sm">
                            Plateforme connectée avec succès
                        </Text>
                    </Box>
                </Skeleton>
            );
        }
        if (available) {
            return (
                <Box margin="4px 0" display="flex" alignItems="center">
                    <Button
                        onClick={onOpen}
                        width="100%"
                        colorScheme="teal"
                        variant="outline"
                    >
                        Connecter
                    </Button>
                </Box>
            );
        }

        return (
            <Box margin="4px 0" display="flex" alignItems="center">
                <Box
                    width="100%"
                    textAlign="center"
                    margin="1"
                    color="purple.500"
                >
                    <i>Bientôt disponible</i>
                </Box>
            </Box>
        );
    };

    return (
        <Box
            width={{ base: "100%", sm: "100%" }}
            flex={{ lg: "1 0 21%" }}
            maxWidth={{ md: "unset", lg: "380px" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor="#F2F2FF"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            background="white"
        >
            <Box
                display="flex"
                height="100%"
                flexDirection="column"
                padding="6"
            >
                <Box
                    display="flex"
                    flex="1"
                    justifyContent="space-between"
                    alignItems="center"
                    opacity={platform ? 1 : 0.6}
                >
                    <Box display="flex" alignItems="center" gap="2">
                        <Avatar
                            size="md"
                            name="Dan Abrahmov"
                            src={`/${platformKey.toLowerCase()}.png`}
                        />
                        <Text
                            textTransform="capitalize"
                            fontSize="md"
                            fontWeight="bold"
                        >
                            {platformKey.toLocaleLowerCase()}
                        </Text>
                    </Box>

                    <Box hidden={!platform}>
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                icon={<BsThreeDotsVertical />}
                                variant="ghost"
                            />
                            <MenuList>
                                <MenuItem
                                    onClick={onOpenAlert}
                                    icon={<MdDelete />}
                                >
                                    Supprimer
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        <AlertDialog
                            isOpen={isOpenAlert}
                            leastDestructiveRef={cancelRef}
                            onClose={onCloseAlert}
                        >
                            <AlertDialogOverlay>
                                <AlertDialogContent>
                                    <AlertDialogHeader
                                        fontSize="lg"
                                        fontWeight="bold"
                                    >
                                        <Box display="flex" alignItems="center">
                                            <Avatar
                                                size="xs"
                                                name="Dan Abrahmov"
                                                marginRight="2"
                                                src={`/${platformKey.toLowerCase()}.png`}
                                            />
                                            Supprimer la plateforme "{platformKey}"
                                        </Box>
                                    </AlertDialogHeader>

                                    <AlertDialogBody>
                                        Êtes-vous sûr ? Vos stories seront supprimées.
                                    </AlertDialogBody>

                                    <AlertDialogFooter>
                                        <Button onClick={onCloseAlert}>
                                            Annuler
                                        </Button>
                                        {platform?.id && (
                                            <Button
                                                isLoading={
                                                    isLoadingDeletePlatform
                                                }
                                                colorScheme="red"
                                                ml={3}
                                                onClick={() => {
                                                    mutateDeletePlatform({
														id: platform.id,
													});
                                                }}
                                            >
                                                Supprimer quand même
                                            </Button>
                                        )}
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>
                    </Box>
                </Box>

                <Divider marginTop="3" marginBottom="3" />

                <Skeleton isLoaded={!isLoading}>
                    {renderBottom(available, platform)}
                </Skeleton>
            </Box>
            <CreateUpdatePlatform
                platformKey={platformKey}
                platform={platform}
                isOpen={isOpen}
                onClose={onClose}
                createUpdatePlatform={createUpdatePlatform}
                isLoadingCreateUpdatePlatform={isLoadingCreateUpdatePlatform}
            />
        </Box>
    );
};
