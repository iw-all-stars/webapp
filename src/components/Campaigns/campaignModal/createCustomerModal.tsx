import {
	Box,
	Button,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalOverlay,
	Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const CreateCustomerModal = ({ isOpen, onClose, onOpen }: Props) => {
  const router = useRouter();
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  const addCustomer = () => {
    router.push(
      `/dashboard/${router.query.organizationId as string}/restaurant/${
        router.query.restaurantId as string
      }/campaigns?tab=customers`
    );
    onClose();
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />

        <ModalBody pt={20} pb={12}>
          <Box
            w="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            gap={5}
          >
            <Image alt="cape" src="/assets/Cape1.svg" width={90} height={98} />
            <Text fontSize={18} fontWeight={700}>
              Client mystère !
            </Text>
            <Text fontSize={13} fontWeight={400}>
              Pour lancer une campagne,
              <br />
              vous devez ajouter des clients dans l'onglet "Clients"
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
        >
          <Button onClick={onClose} mr={3}>
            Plus tard
          </Button>
          <Button colorScheme={"purple"} onClick={addCustomer}>
            Ajouter maintenant
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateCustomerModal;
