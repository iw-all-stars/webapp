import {
    FormControl,
    FormErrorMessage,
    Input,
    FormLabel,
    Select,
    Button,
    Heading,
    Flex,
    useToast,
    Text,
    AlertDialog,
    useDisclosure,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from "@chakra-ui/react";
import { type GetServerSideProps, type NextPage } from "next";
import { Box } from "@chakra-ui/react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import Autocomplete from "react-google-autocomplete";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { hasAccessToRestaurant } from "~/utils/hasAccessToRestaurantServerSideProps";

type OrganizationFormValues = {
    name: string;
};

type RestaurantFormValues = {
    name: string;
    categoryId: string;
    address: string;
    latitude: number;
    longitude: number;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    return hasAccessToRestaurant(context);
};

const DashboardSettings: NextPage = () => {
    const toast = useToast();

    const context = api.useContext();
    const router = useRouter();
    const { organizationId, restaurantId } = router.query;

    const [placeId, setPlaceId] = useState<string | null>("firstLoad");

    const {
        isOpen: isOpenAlert,
        onOpen: onOpenAlert,
        onClose: onCloseAlert,
    } = useDisclosure();
    const cancelRef = useRef<HTMLInputElement>(null);

    const { data: currentUser } = api.user.getCurrent.useQuery();
    const {
        mutate: mutateDeleteRestaurantById,
        isLoading: isLoadingDeleteRestaurantById,
    } = api.restaurant.deleteById.useMutation({
        onSuccess: () => {
            router.push(`/`);
            toast({
                title: "Restaurant supprimé",
                description: "Le restaurant a été supprimé avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const isAdminOfOrganization = useMemo(() => {
        if (!currentUser || !organizationId) return false;
        return (
            currentUser.organizations.find(
                (organization) => organization.organizationId === organizationId
            )?.role === "ADMIN"
        );
    }, [currentUser, organizationId]);

    const { data: currentRestaurant } = api.restaurant.getById.useQuery(
        { id: restaurantId as string },
        { enabled: !!restaurantId, refetchOnWindowFocus: false }
    );

    const { data: currentOrganization } = api.organization.getById.useQuery(
        { id: organizationId as string },
        { enabled: !!organizationId, refetchOnWindowFocus: false }
    );

    const updateOrganization = api.organization.update.useMutation({
        onSuccess: () => {
            context.organization.getById.invalidate({
                id: organizationId as string,
            });
            context.organization.getByCurrentUser.invalidate();
            toast({
                title: "Organisation mise à jour",
                description: "L'organisation a été mise à jour avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        },
    });
    const updateRestaurant = api.restaurant.update.useMutation({
        onSuccess: () => {
            context.restaurant.getById.invalidate({
                id: restaurantId as string,
            });
            context.restaurant.getByOrganizationId.invalidate({
                organizationId: organizationId as string,
            });
            toast({
                title: "Restaurant mis à jour",
                description: "Le restaurant a été mis à jour avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const {
        register: registerOrganization,
        formState: {
            errors: errorsOrganization,
            isSubmitting: isSubmittingOrganization,
        },
        handleSubmit: handleSubmitOrganization,
        reset: resetOrganization,
    } = useForm<OrganizationFormValues>();
    const {
        register: registerRestaurant,
        formState: {
            errors: errorsRestaurant,
            isSubmitting: isSubmittingRestaurant,
            isValid: isValidFormRestaurant,
        },
        handleSubmit: handleSubmitRestaurant,
        control,
        reset: resetRestaurant,
    } = useForm<RestaurantFormValues>();

    const { data: categories } = api.category.getAll.useQuery();

    const handleUpdateOrganization: SubmitHandler<
        OrganizationFormValues
    > = async (updatedOrganizationForm) => {
        await updateOrganization.mutateAsync({
            id: organizationId as string,
            name: updatedOrganizationForm.name,
        });
    };

    const handleUpdateRestaurant: SubmitHandler<RestaurantFormValues> = async (
        updatedRestaurantForm
    ) => {
        await updateRestaurant.mutateAsync({
            id: restaurantId as string,
            organizationId: organizationId as string,
            name: updatedRestaurantForm.name,
            categoryId: updatedRestaurantForm.categoryId,
            address: updatedRestaurantForm.address,
            latitude: updatedRestaurantForm.latitude,
            longitude: updatedRestaurantForm.longitude,
        });
    };

    useEffect(() => {
        if (currentRestaurant) {
            resetRestaurant({
                name: currentRestaurant.name,
                categoryId: currentRestaurant.categoryId ?? "",
                address: currentRestaurant.address ?? "",
                latitude: currentRestaurant.latitude ?? 0,
                longitude: currentRestaurant.longitude ?? 0,
            });
        }
    }, [currentRestaurant]);

    useEffect(() => {
        if (currentOrganization) {
            resetOrganization({
                name: currentOrganization.name,
            });
        }
    }, [currentOrganization]);

    return (
        <Box py={8} display="flex" flexDirection="column" h="full" w="full">
            <Box display="flex" overflowY="auto" flexDirection="column">
                <Heading pb={5} fontSize={18}>
                    Paramètres
                </Heading>
                <Flex direction="column" gap={8}>
                    {isAdminOfOrganization && (
                        <Box
                            as="form"
                            onSubmit={handleSubmitOrganization(
                                handleUpdateOrganization
                            )}
                            bg="white"
                            shadow="sm"
                            rounded="xl"
                            ringColor="gray.900"
                        >
                            <Box px={4} py={6}>
                                <Heading as="h4" pb={6} fontSize={18}>
                                    Modifier l'organisation
                                </Heading>
                                <FormControl
                                    isInvalid={!!errorsOrganization.name}
                                >
                                    <FormLabel>
                                        Nom de votre organisation
                                    </FormLabel>
                                    <Input
                                        {...registerOrganization("name", {
                                            required: true,
                                        })}
                                    />
                                    <FormErrorMessage>
                                        Le nom du restaurant est obligatoire !
                                    </FormErrorMessage>
                                </FormControl>
                                <Flex justify="flex-end" mt={8}>
                                    <Button
                                        type="submit"
                                        colorScheme="blue"
                                        isLoading={isSubmittingOrganization}
                                    >
                                        Enregistrer
                                    </Button>
                                </Flex>
                            </Box>
                        </Box>
                    )}
                    <Box
                        as="form"
                        onSubmit={handleSubmitRestaurant(
                            handleUpdateRestaurant
                        )}
                        bg="white"
                        shadow="sm"
                        rounded="xl"
                        ringColor="gray.900"
                    >
                        <Box px={4} py={6}>
                            <Heading as="h4" size="lg" pb={6} fontSize={18}>
                                Modifier le restaurant
                            </Heading>
                            <FormControl isInvalid={!!errorsRestaurant.name}>
                                <FormLabel>Nom de votre restaurant</FormLabel>
                                <Input
                                    {...registerRestaurant("name", {
                                        required: true,
                                    })}
                                />
                                <FormErrorMessage>
                                    Le nom du restaurant est obligatoire !
                                </FormErrorMessage>
                            </FormControl>
                            <FormControl
                                mt={4}
                                isInvalid={!!errorsRestaurant.categoryId}
                            >
                                <FormLabel>Catégorie</FormLabel>
                                <Select
                                    {...registerRestaurant("categoryId", {
                                        required: true,
                                    })}
                                    placeholder="Choissisez une catégorie"
                                >
                                    {categories?.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                mt={4}
                                isInvalid={!!errorsRestaurant.address}
                                aria-autocomplete="none"
                            >
                                <FormLabel>Adresse</FormLabel>
                                <Controller
                                    name="address"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => {
                                        const { onChange, ...tmpField } = field;
                                        return (
                                            <Autocomplete
                                                placeholder="Entrez l'adresse de votre établissement"
                                                apiKey="AIzaSyC4tPk2jjqzK6lXe6xCwCE6RGtLtIyh858"
                                                onPlaceSelected={(place: {
                                                    place_id: string;
                                                    formatted_address: string;
                                                    geometry: {
                                                        location: {
                                                            lat: () => number;
                                                            lng: () => number;
                                                        };
                                                    };
                                                }) => {
                                                    setPlaceId(place.place_id);
                                                    field.onChange(
                                                        place.formatted_address
                                                    );
                                                    registerRestaurant(
                                                        "latitude",
                                                        {
                                                            value: place.geometry.location.lat(),
                                                            required: true,
                                                        }
                                                    );
                                                    registerRestaurant(
                                                        "longitude",
                                                        {
                                                            value: place.geometry.location.lng(),
                                                            required: true,
                                                        }
                                                    );
                                                }}
                                                style={{
                                                    width: "100%",
                                                    height: "var(--chakra-sizes-10)",
                                                    borderRadius:
                                                        "var(--chakra-radii-md)",
                                                    border: "1px solid",
                                                    borderColor: "inherit",
                                                    paddingInlineStart:
                                                        "var(--chakra-space-4)",
                                                    paddingInlineEnd:
                                                        "var(--chakra-space-4)",
                                                }}
                                                options={{
                                                    types: ["address"],
                                                    componentRestrictions: {
                                                        country: "fr",
                                                    },
                                                }}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    setPlaceId(null);
                                                    onChange(e.target.value);
                                                }}
                                                {...tmpField}
                                            />
                                        );
                                    }}
                                />
                                <FormErrorMessage>
                                    {errorsRestaurant.address?.type}
                                </FormErrorMessage>
                            </FormControl>
                            <Flex justify="flex-end" mt={8}>
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    isLoading={isSubmittingRestaurant}
                                    isDisabled={
                                        !isValidFormRestaurant || !placeId
                                    }
                                >
                                    Enregistrer
                                </Button>
                            </Flex>
                        </Box>
                    </Box>

                    {isAdminOfOrganization && (
                        <Box
                            bg="white"
                            shadow="sm"
                            rounded="xl"
                            border="1px solid red"
                            ringColor="red.900"
                        >
                            <Box px={4} py={6}>
                                <Heading as="h4" size="lg" pb={6} fontSize={18}>
                                    Zone de danger
                                </Heading>
                                <Flex justify="space-between" mt={8}>
                                    <Text
                                        fontSize="md"
                                        fontWeight="medium"
                                        color="red.500"
                                    >
                                        Supprimer le restaurant
                                    </Text>
                                    <Button
                                        type="submit"
                                        colorScheme="red"
                                        onClick={onOpenAlert}
                                    >
                                        Supprimer
                                    </Button>
                                </Flex>
                            </Box>
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
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                Supprimer le restaurant
                                            </Box>
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                            Êtes-vous sûr ? Vos stories ansi que
                                            vos campagnes et clients seront
                                            supprimées.
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <Button onClick={onCloseAlert}>
                                                Annuler
                                            </Button>
                                            <Button
                                                isLoading={
                                                    isLoadingDeleteRestaurantById
                                                }
                                                colorScheme="red"
                                                ml={3}
                                                onClick={() => {
                                                    mutateDeleteRestaurantById({
                                                        id: router.query
                                                            .restaurantId as string,
                                                    });
                                                }}
                                            >
                                                Supprimer quand même
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </Box>
                    )}
                </Flex>
            </Box>
        </Box>
    );
};

export default DashboardSettings;
