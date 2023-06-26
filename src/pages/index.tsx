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
    Select,
    Skeleton, SkeletonCircle, Text,
    useDisclosure
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import Autocomplete from "react-google-autocomplete";

type RestaurantFormValues = {
  organizationName: string;
  name: string;
  categoryId: string;
  address: string;
  latitude: number;
  longitude: number;
};

const Home: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, formState: { errors }, handleSubmit, control, reset } = useForm<RestaurantFormValues>();

  const router = useRouter();
  const utils = api.useContext();

  const { data: session, status: sessionStatus } = useSession();

  const { data: categories } = api.category.getAll.useQuery();
  const organizations = api.organization.getByUserId.useQuery();

  const addOrganization = api.organization.add.useMutation({
    onSuccess: () => utils.organization.getByUserId.invalidate(),
  });

  const addRestaurant = api.restaurant.add.useMutation({
    onSuccess: () => utils.organization.getByUserId.invalidate(),
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
              <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={8}>
                {organizations.data?.map((organization) => (
                  <GridItem key={organization.id}>
                    <Card variant="filled" borderRadius={6} minH={32} cursor="pointer" _hover={{ bg: "gray.200" }} onClick={() => router.push(`/dashboard/${organization.id}/restaurant/${organization.restaurants[0]?.id}`)}>
                      <CardBody display="flex" flexDirection="column" justifyContent="space-between">
                        <Text fontSize="2xl" fontWeight="bold">{organization.name}</Text>
                        <Text fontSize="md" color="gray.500">{organization.restaurants.length} restaurant{organization.restaurants.length > 1 ? "s" : ""}</Text>
                      </CardBody>
                    </Card>
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
                    render={({ field }) =>
                      <Autocomplete
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                        onPlaceSelected={(place: { formatted_address: string, geometry: { location: { lat: () => number, lng: () => number }}}) => {
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
                        {...field}
                      />
                    }
                  />
                  <FormErrorMessage>{errors.address?.type}</FormErrorMessage>
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
