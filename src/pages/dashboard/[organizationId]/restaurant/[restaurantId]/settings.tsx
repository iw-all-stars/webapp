import { FormControl, FormErrorMessage, Input, FormLabel, Select, Button, Heading, Flex } from "@chakra-ui/react";
import { type NextPage } from "next";
import { Box } from "@chakra-ui/react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import Autocomplete from "react-google-autocomplete";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

type OrganizationFormValues = {
  name: string;
};

type RestaurantFormValues = {
  name: string;
  categoryId: string;
  address: string;
  latitude: number;
  longitude: number;
}

const DashboardSettings: NextPage = () => {

  const context = api.useContext();
  const router = useRouter();
  const { organizationId, restaurantId } = router.query;

  const { data: currentRestaurant } = api.restaurant.getById.useQuery(
    { id: restaurantId as string },
    { enabled: !!restaurantId }
  );

  const { data: currentOrganization } = api.organization.getById.useQuery(
    { id: organizationId as string },
    { enabled: !!organizationId }
  );

  const updateOrganization = api.organization.update.useMutation({
    onSuccess: () => {
      context.organization.getById.invalidate({ id: organizationId as string })
      context.organization.getByCurrentUser.invalidate()
    }
  });
  const updateRestaurant = api.restaurant.update.useMutation({
    onSuccess: () => {
      context.restaurant.getById.invalidate({ id: restaurantId as string })
      context.restaurant.getByOrganizationId.invalidate({ organizationId: organizationId as string })
    }
  });

  const { register: registerOrganization, formState: { errors: errorsOrganization, isSubmitting: isSubmittingOrganization }, handleSubmit: handleSubmitOrganization, reset: resetOrganization } = useForm<OrganizationFormValues>();
  const { register: registerRestaurant, formState: { errors: errorsRestaurant, isSubmitting: isSubmittingRestaurant }, handleSubmit: handleSubmitRestaurant, control, reset: resetRestaurant } = useForm<RestaurantFormValues>();

  const { data: categories } = api.category.getAll.useQuery();

  const handleUpdateOrganization: SubmitHandler<OrganizationFormValues> = async (updatedOrganizationForm) => {
    await updateOrganization.mutateAsync({
      id: organizationId as string,
      name: updatedOrganizationForm.name,
    });
  }

  const handleUpdateRestaurant: SubmitHandler<RestaurantFormValues> = async (updatedRestaurantForm) => {
    await updateRestaurant.mutateAsync({
      id: restaurantId as string,
      organizationId: organizationId as string,
      name: updatedRestaurantForm.name,
      categoryId: updatedRestaurantForm.categoryId,
      address: updatedRestaurantForm.address,
      latitude: updatedRestaurantForm.latitude,
      longitude: updatedRestaurantForm.longitude,
    });
  }

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
	  <Heading pb={5}>Paramètres</Heading>
      <Flex direction="column" gap={8}>
        <Box as="form" onSubmit={handleSubmitOrganization(handleUpdateOrganization)} bg="white" shadow="sm" rounded="xl" ringColor="gray.900">
          <Box px={4} py={6}>
            <Heading as="h4" size="lg" pb={6}>Modifier l'organisation</Heading>
            <FormControl isInvalid={!!errorsOrganization.name}>
              <FormLabel>Nom de votre organisation</FormLabel>
              <Input {...registerOrganization("name", { required: true })} />
              <FormErrorMessage>Le nom du restaurant est obligatoire !</FormErrorMessage>
            </FormControl>
            <Flex justify="flex-end" mt={8}>
              <Button type="submit" colorScheme="blue" isLoading={isSubmittingOrganization}>
                Enregistrer
              </Button>
            </Flex>
          </Box>
        </Box>
        <Box as="form" onSubmit={handleSubmitRestaurant(handleUpdateRestaurant)} bg="white" shadow="sm" rounded="xl" ringColor="gray.900">
          <Box px={4} py={6}>
            <Heading as="h4" size="lg" pb={6}>Modifier le restaurant</Heading>
            <FormControl isInvalid={!!errorsRestaurant.name}>
              <FormLabel>Nom de votre restaurant</FormLabel>
              <Input {...registerRestaurant("name", { required: true })} />
              <FormErrorMessage>Le nom du restaurant est obligatoire !</FormErrorMessage>
            </FormControl>
            <FormControl mt={4} isInvalid={!!errorsRestaurant.categoryId}>
              <FormLabel>Catégorie</FormLabel>
              <Select {...registerRestaurant("categoryId", { required: true })} placeholder="Choissisez une catégorie">
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4} isInvalid={!!errorsRestaurant.address} aria-autocomplete="none">
              <FormLabel>Adresse</FormLabel>
              <Controller
                name="address"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  const { onChange, ...tmpField } = field;
                  return (
                    <Autocomplete
                      apiKey="AIzaSyC4tPk2jjqzK6lXe6xCwCE6RGtLtIyh858"
                      onPlaceSelected={(place: { formatted_address: string, geometry: { location: { lat: () => number, lng: () => number }}}) => {
                        field.onChange(place.formatted_address);
                        registerRestaurant("latitude", { value: place.geometry.location.lat(), required: true });
                        registerRestaurant("longitude", { value: place.geometry.location.lng(), required: true });
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                      {...tmpField}
                    />
                  )
                }}
              />
              <FormErrorMessage>{errorsRestaurant.address?.type}</FormErrorMessage>
            </FormControl>
            <Flex justify="flex-end" mt={8}>
              <Button type="submit" colorScheme="blue" isLoading={isSubmittingRestaurant}>
                Enregistrer
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
	  </Box>
    </Box>
  );
};

export default DashboardSettings;
