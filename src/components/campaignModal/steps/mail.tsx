import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputGroup,
  InputLeftAddon,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { type Campaign } from "@prisma/client";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type FormValues } from "..";

interface MailProps {
  campaign?: Campaign;
  disabled: boolean;
  handleCampaign: SubmitHandler<FormValues>;
}

export const MailStep = ({ campaign, disabled, handleCampaign }: MailProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();

  return (
    <Box>
      <form onSubmit={handleSubmit(handleCampaign)}>
        <FormControl isInvalid={!!errors.subject}>
          <FormLabel>Sujet du mail</FormLabel>
          <Input
            {...register("subject", { required: true })}
            defaultValue={campaign?.subject}
            readOnly={disabled}
            placeholder="Enquête de satisfaction"
          />
          <FormErrorMessage>
            Le sujet du mail est obligatoire !
          </FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={!!errors.body}>
          <FormLabel>Corps du mail</FormLabel>
          <Textarea
            {...register("body", { required: true })}
            defaultValue={campaign?.body}
            readOnly={disabled}
            placeholder="Bonjour, ..."
          />
          <FormErrorMessage>
            Le corps du mail est obligatoire !
          </FormErrorMessage>
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>URL de redirection</FormLabel>
          <InputGroup size="sm">
            <InputLeftAddon>https://</InputLeftAddon>
            <Input
              {...register("url", { required: false })}
              defaultValue={campaign?.url}
              readOnly={disabled}
              placeholder="monsite"
            />
          </InputGroup>
        </FormControl>
      </form>
    </Box>
  );
};

export default MailStep;
