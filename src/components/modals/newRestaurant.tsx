import { Modal, ModalOverlay, ModalContent, FormControl, FormErrorMessage, ModalHeader, ModalCloseButton, ModalBody, Input, FormLabel, Select, ModalFooter, Button, useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Autocomplete from "react-google-autocomplete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";

type RestaurantFormValues = {
  name: string;
  categoryId: string;
  address: string;
  latitude: number;
  longitude: number;
}

const ModalNewRestaurant = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {

  const toast = useToast();

  const [placeId, setPlaceId] = useState<string | null>(null);

  const context = api.useContext();
  const router = useRouter();
  const { data: session } = useSession();

  const { register, formState: { errors, isValid }, handleSubmit, control, reset } = useForm<RestaurantFormValues>();

  const { data: categories } = api.category.getAll.useQuery();

  const addRestaurant = api.restaurant.add.useMutation({
    onSuccess: () => context.restaurant.getByOrganizationId.invalidate(),
  });

  const handleAddRestaurant: SubmitHandler<RestaurantFormValues> = async (newRestaurantForm) => {
    if (session && router.query.organizationId) {
      const newRestaurant = await addRestaurant.mutateAsync({
        ...newRestaurantForm,
        organizationId: router.query.organizationId as string,
      });
	  toast({
		title: "Restaurant créé.",
		description: "Votre restaurant a bien été créé.",
		status: "success",
		duration: 5000,
		isClosable: true,
	  });
      reset();
      onClose();
      router.push(`/dashboard/${router.query.organizationId}/restaurant/${newRestaurant.id}/stories`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} onCloseComplete={() => reset()}>
      <ModalOverlay />
      <ModalContent zIndex={0}>
        <form onSubmit={handleSubmit(handleAddRestaurant)}>
          <ModalHeader>Créer un Restaurant</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Nom de votre restaurant</FormLabel>
              <Input {...register("name", { required: true })} placeholder="Nom de votre restaurant" />
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
                        setPlaceId(place.place_id);
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
            <Button colorScheme="blue" mr={3} type="submit" isLoading={
				addRestaurant.isLoading
			} isDisabled={
				!isValid || !placeId
			}>
              Valider
            </Button>
            <Button onClick={onClose}>Annuler</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default ModalNewRestaurant;