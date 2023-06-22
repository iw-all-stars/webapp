import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { type Campaign } from "@prisma/client";
import React, { type Ref } from "react";
import { useForm } from "react-hook-form";
import { type FormValues } from "..";
import { CampaignContext } from "../../CampaignContext";

interface CampaignProps {
  disabled: boolean;
  initialRef: Ref<HTMLInputElement>;
}

export const CampaignStep = ({
  disabled,
  initialRef,
}: CampaignProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();
  const context = React.useContext(CampaignContext);

  return (
    <Box>
      <form
        onSubmit={handleSubmit((values) =>
          context?.setCampaign({ ...context?.campaign, ...values } as Campaign)
        )}
      >
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Quel est le nom de votre campagne</FormLabel>
          <Input
            {...register("name", { required: true })}
            defaultValue={context?.campaign?.name}
            ref={initialRef}
            readOnly={disabled}
            placeholder="Enquête de satisfaction"
            // onChange permet de mettre à jour le state de la campagne
            // Car dans les steps on a pas de bouton submit
            onChange={(e) => {
              const name = e.target.value;
              context?.setCampaign({ ...context?.campaign, name } as Campaign);
            }}
          />
          <FormErrorMessage>
            Le nom de la campagne est obligatoire !
          </FormErrorMessage>
        </FormControl>
      </form>
    </Box>
  );
};

export default CampaignStep;
