import {
    Box,
    Button,
    Card, CardBody, Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Grid, GridItem,
    Heading,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Skeleton, SkeletonCircle, Text,
    useDisclosure,
    Select,
	useToast,
  Center,
  AvatarGroup,
  Avatar,
  Icon
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import Autocomplete from "react-google-autocomplete";
import { useState } from "react";
import { NoDataFound } from "~/components/NoDataFound";
import { AiFillShop } from "react-icons/ai";

type RestaurantFormValues = {
  organizationName: string;
  name: string;
  categoryId: string;
  address: string;
  latitude: number;
  longitude: number;
};

const Home: NextPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, formState: { errors, isValid }, handleSubmit, control, reset } = useForm<RestaurantFormValues>();

  const [placeId, setPlaceId] = useState<string | null>(null);

  const router = useRouter();
  const utils = api.useContext();

  const { data: session, status: sessionStatus } = useSession();

  const { data: categories } = api.category.getAll.useQuery();
  const { data: organizations, isLoading: isLoadingOrganizations } = api.organization.getByCurrentUser.useQuery(undefined, {
    initialData: Array(4).fill(0),
  });

  const addOrganization = api.organization.add.useMutation({
    onSuccess: () => utils.organization.getByCurrentUser.invalidate(),
  });

  const addRestaurant = api.restaurant.add.useMutation({
    onSuccess: () => {
      utils.organization.getByCurrentUser.invalidate();
      toast({
        title: "Restaurant créé.",
        description: "Votre restaurant a bien été créé.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
	  },
  });

  const handleOrganization: SubmitHandler<RestaurantFormValues> = async (restaurantForm) => {
    if (session) {
      const { organizationName, ...restaurant } = restaurantForm;

      const newOrganization = await addOrganization.mutateAsync({
        name: organizationName,
        userId: session.user.id,
      })

      addRestaurant.mutate({
        ...restaurant,
        organizationId: newOrganization.id,
      });

      reset();
      onClose();
    }
  };

  return (
    <>
      <Box h="full" w="full" pt={8}>
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap={4}>
            <SkeletonCircle h={10} w={10} rounded="full" isLoaded={!!session?.user?.id}>
              <Image h={10} w={10} rounded="full" src={session?.user?.image ?? ""} alt="User profile image" />
            </SkeletonCircle>
            <Skeleton isLoaded={sessionStatus !== "loading"} h={6}>
              <Text minW={28}>{session?.user.name}</Text>
            </Skeleton>
          </Flex>
          <Button onClick={onOpen}>Créer une organisation</Button>
        </Flex>
        {organizations.length > 0 ? (
          <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={8}>
            {organizations.map(organization => !isLoadingOrganizations && organization.id ? (
              <GridItem key={organization.id}>
                <Card variant="filled" borderRadius={6} minH={32} cursor="pointer" _hover={{ bg: "gray.200" }} onClick={() => router.push(`/dashboard/${organization.id}/restaurant/${organization.restaurants[0]?.id}/stories`)}>
                  <CardBody display="flex" flexDirection="column" justifyContent="space-between">
                    <Text fontSize="2xl" fontWeight="bold">{organization.name}</Text>
                    <Flex justifyContent="space-between" gap={2}>
                      <Flex alignItems="center" gap={2}>
                        <Text fontSize="lg" color="gray.500">{organization.restaurants.length} restaurant{organization.restaurants.length > 1 ? "s" : ""}</Text>
                        <Icon as={AiFillShop} mt={0.5} w={5} h={5} />
                      </Flex>
                      <AvatarGroup size="md" max={3}>
                        {organization.users.map(({ user }) => (
                          <Avatar key={user.id} name={user.name ?? ""} src={user.image ?? ""} />
                        ))}
                      </AvatarGroup>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            ) : (
              <GridItem key={organization.id}>
                <Card variant="filled" borderRadius={6} minH={32}>
                  <CardBody display="flex" flexDirection="column" justifyContent="space-between">
                    <Skeleton h={7} />
                    <Flex justifyContent="space-between" alignItems="center" gap={2}>
                      <Skeleton h={5} w="50%" />
                      <AvatarGroup size="md" max={3}>
                        {Array(3).fill(0).map((_, index) => (
                          <SkeletonCircle key={index} h={12} w={12} />
                        ))}
                      </AvatarGroup>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        ) : (
          <Center h="75%">
             <NoDataFound text="Vous n'avez pas encore d'organisation." />
          </Center>
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} onCloseComplete={() => reset()}>
        <ModalOverlay />
        <ModalContent zIndex={0}>
          <form onSubmit={handleSubmit(handleOrganization)}>
            <ModalHeader>Créer votre organisation</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                <FormControl isInvalid={!!errors.organizationName}>
                  <FormLabel>Nom de votre organisation</FormLabel>
                  <Input {...register("organizationName", { required: true })} />
                  <FormErrorMessage>Le nom de l'organisation est obligatoire !</FormErrorMessage>
                </FormControl>
                <Divider mt={8} mb={6} />
                <Heading size="md">Restaurant par défaut</Heading>
                <FormControl mt={4} isInvalid={!!errors.name}>
                  <FormLabel>Nom de votre restaurant</FormLabel>
                  <Input {...register("name", { required: true })} />
                  <FormErrorMessage>Le nom du restaurant est obligatoire !</FormErrorMessage>
                </FormControl>
                <FormControl mt={4} isInvalid={!!errors.categoryId}>
                  <FormLabel>Catégorie</FormLabel>
                  <Select {...register("categoryId", { required: true })} placeholder="Choissisez une catégorie">
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mt={4} isInvalid={!!errors.address} aria-autocomplete="none">
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
                          onPlaceSelected={(place: { place_id: string, formatted_address: string, geometry: { location: { lat: () => number, lng: () => number }}}) => {
                            setPlaceId(place.place_id)
							field.onChange(place.formatted_address);
                            register("latitude", { value: place.geometry.location.lat(), required: true });
                            register("longitude", { value: place.geometry.location.lng(), required: true });
                          }}
                          style={{
                            width: "100%",
                            height: "var(--chakra-sizes-10)",
                            borderRadius: "var(--chakra-radii-md)",
                            border: "1px solid",
                            borderColor: "inherit",
                            paddingInlineStart: "var(--chakra-space-4)",
                            paddingInlineEnd: "var(--chakra-space-4)",
                          }}
                          options={{
                            types: ["address"],
                            componentRestrictions: { country: "fr" },
                          }}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setPlaceId(null);
							onChange(e.target.value)
						  }}
                          {...tmpField}
                        />
                      )
                    }}
                  />
                  <FormErrorMessage>{errors.address?.type}</FormErrorMessage>
                </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} type="submit" isDisabled={!isValid || !placeId}>
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
