import { Box } from "@chakra-ui/react";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClientModal = ({ isOpen, onClose }: Props) => {
  return (
    <Box>
      <Box></Box>
    </Box>
  )
};

export default CreateClientModal;
