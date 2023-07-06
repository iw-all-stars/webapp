import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

interface ImportClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportClientModal: React.FC<ImportClientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const utils = api.useContext();
  const toast = useToast();
  const router = useRouter();
  const { restaurantId } = router.query;

  const [isLoading, setIsLoading] = React.useState(false);

  const importFile = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`/api/xlsx/${restaurantId}/clients/upload`, {
      method: "POST",
      body: formData,
    });
    const res = await response.json() as { success: boolean; message: string };
    if (res.success) {
      utils.customer.getCountClients.invalidate();
      utils.customer.getClients.invalidate();
      onClose();
      toast({
        title: "Importation réussie",
        description: "Les clients ont été importés avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Erreur",
        description: res.message || "Une erreur est survenue.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <Modal size={"2xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Importer des clients</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Pour importer plusieurs clients depuis un fichier XSLX.
            <br />
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => {
                window.open(
                  window.location.origin +
                    `/api/xlsx/${restaurantId}/clients/template`,
                  "_blank"
                );
              }}
            >
              Télécharger le modèle XSLX
            </Button>
            , remplissez-le avec vos clients puis importez-le.
            <br />
          </Text>
        </ModalBody>
        <ModalFooter gap={4}>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            isLoading={isLoading}
            onClick={() => {
              const fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.accept = ".xlsx";
              fileInput.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  importFile(file);
                }
              };
              fileInput.click();
            }}
          >
            Importer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImportClientModal;
