import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { Campaign } from "@prisma/client";
import React, { Ref, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { FormValues } from "..";

interface CampaignProps {
  campaign: Campaign;
  disabled: boolean;
  initialRef: Ref<HTMLInputElement>;
  on: {
    setCampaign: (campaign: Campaign) => void;
    handleCampaign: SubmitHandler<FormValues>;
  };
}

export const CampaignStep = ({
  campaign,
  disabled,
  initialRef,
  on: { setCampaign, handleCampaign },
}: CampaignProps) => {
  const campaignTypes = api.campaign.getCampaignTypes.useQuery();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormValues>();

  useEffect(() => {
    campaignTypes.refetch();
    setCampaign({ ...campaign });
  }, [campaign]);

  return (
    <Box>
      <form onSubmit={handleSubmit(handleCampaign)}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Nom de la campagne</FormLabel>
          <Input
            {...register("name", { required: true })}
            defaultValue={campaign?.name}
            ref={initialRef}
            readOnly={disabled}
            placeholder="Enquête de satisfaction"
          />
          <FormErrorMessage>
            Le nom de la campagne est obligatoire !
          </FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={!!errors.typeId}>
          <FormLabel>Type</FormLabel>
          <Select
            {...register("typeId", { required: true })}
            multiple={false}
            disabled={disabled}
            placeholder="Séléctionnez un type"
            defaultValue={campaign?.typeId}
          >
            {campaignTypes?.data?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>
            Le type de campagne est obligatoire !
          </FormErrorMessage>
        </FormControl>
      </form>
    </Box>
  );
};

export default CampaignStep;