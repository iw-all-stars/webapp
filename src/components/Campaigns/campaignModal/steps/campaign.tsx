import {
  Box,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React, { type Ref } from "react";
import { CampaignContext } from "../../CampaignContext";

interface CampaignProps {
  disabled: boolean;
  initialRef: Ref<HTMLInputElement>;
}

export const CampaignStep = ({ disabled, initialRef }: CampaignProps) => {
  const context = React.useContext(CampaignContext);

  return (
    <Box>
      <FormControl>
        <FormLabel>Quel est le nom de votre campagne</FormLabel>
        <Input
          defaultValue={context?.campaign?.name}
          ref={initialRef}
          readOnly={disabled}
          placeholder="Enquête de satisfaction"
          onChange={(e) => {
            const name = e.target.value;
            context?.setCampaign({ ...context?.campaign, name });
          }}
        />
      </FormControl>
    </Box>
  );
};

export default CampaignStep;
