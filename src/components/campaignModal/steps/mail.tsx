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
import { useForm } from "react-hook-form";
import { type FormValues } from "..";

interface MailProps {
  campaign?: Campaign;
  disabled: boolean;
  setCampaign: (campaign: Campaign) => void;
}

export const MailStep = ({ campaign, disabled, setCampaign }: MailProps) => {
  const {
    register,
    formState: { errors },
  } = useForm<FormValues>();

  return (
    <Box>
      <FormControl isInvalid={!!errors.subject}>
        <FormLabel>Sujet du mail</FormLabel>
        <Input
          {...register("subject", { required: true })}
          defaultValue={campaign?.subject}
          readOnly={disabled}
          placeholder="Enquête de satisfaction"
          onChange={(e) => {
            if (!campaign) return;
            const subject = e.target.value;
            campaign.subject = subject;
            setCampaign(campaign);
          }}
        />
        <FormErrorMessage>Le sujet du mail est obligatoire !</FormErrorMessage>
      </FormControl>

      <FormControl mt={4} isInvalid={!!errors.body}>
        <FormLabel>Corps du mail</FormLabel>
        <Textarea
          {...register("body", { required: true })}
          defaultValue={campaign?.body}
          readOnly={disabled}
          placeholder="Bonjour, ..."
          onChange={(e) => {
            if (!campaign) return;
            const body = e.target.value;
            campaign.body = body;
            setCampaign(campaign);
          }}
        />
        <FormErrorMessage>Le corps du mail est obligatoire !</FormErrorMessage>
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
            onChange={(e) => {
              if (!campaign) return;
              const url = e.target.value;
              campaign.url = url;
              setCampaign(campaign);
            }}
          />
        </InputGroup>
      </FormControl>
    </Box>
  );
};

export default MailStep;
