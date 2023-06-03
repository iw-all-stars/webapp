import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { type Campaign } from "@prisma/client";
import React, { type Ref, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { type FormValues } from "..";

interface CampaignProps {
  campaign?: Campaign;
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
  } = useForm<FormValues>();

  useEffect(() => {
    campaignTypes.refetch();
    if (!campaign) return;
    setCampaign({ ...campaign });
  }, [campaign]);

  return (
    <Box>
      <form onSubmit={handleSubmit(handleCampaign)}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Quel est le nom de votre campagne</FormLabel>
          <Input
            {...register("name", { required: true })}
            defaultValue={campaign?.name}
            ref={initialRef}
            readOnly={disabled}
            placeholder="Enquête de satisfaction"
            // onChange permet de mettre à jour le state de la campagne
            // Car dans les steps on a pas de bouton submit
            onChange={(e) => {
              if (!campaign) return;
              const name = e.target.value;
              campaign.name = name;
              setCampaign(campaign);
            }}
          />
          <FormErrorMessage>
            Le nom de la campagne est obligatoire !
          </FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={!!errors.typeId}>
          <FormLabel>Type</FormLabel>
          <Select
            width="45%"
            {...register("typeId", { required: true })}
            multiple={false}
            disabled={disabled}
            placeholder="Séléctionnez un type"
            defaultValue={campaign?.typeId}
            onChange={(e) => {
              if (!e.target.value) return;
              if (!campaign) return;
              const typeId = e.target.value;
              const updatedCampaign = campaign;
              updatedCampaign.typeId = typeId;
              setCampaign(updatedCampaign);
            }}
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
