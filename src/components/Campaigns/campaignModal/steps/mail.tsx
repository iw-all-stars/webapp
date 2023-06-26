import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputGroup,
  InputLeftAddon,
  Textarea,
  Flex,
  Button,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { type FormValues } from "..";
import { CampaignContext } from "../../CampaignContext";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

interface MailProps {
  disabled: boolean;
}

export const MailStep = ({ disabled }: MailProps) => {
  const {
    register,
    formState: { errors },
  } = useForm<FormValues>();
  const context = useContext(CampaignContext);

  const addMailParam = (param: string) => {
    const textarea = document.getElementById("body") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    textarea.value = before + param + after;
    textarea.selectionStart = textarea.selectionEnd = start + param.length;
    textarea.focus();
    const body = textarea.value;
    context?.setCampaign({ ...context?.campaign, body });
  };

  const router = useRouter();

  const { data: currentRestaurant } = api.restaurant.getById.useQuery(
    {
      id: router.query.restaurantId as string,
    },
    {
      enabled: !!router.query.restaurantId,
    }
  );

  return (
    <Box>
      <Flex gap={4} mb={8}>
        <FormControl isInvalid={!!errors.subject}>
          <FormLabel>De la part de</FormLabel>
          <Input
            {...register("fromName", { required: true })}
            defaultValue={currentRestaurant?.name}
            readOnly={disabled}
            placeholder={currentRestaurant?.name}
            onChange={(e) => {
              const fromName = e.target.value;
              context?.setCampaign({ ...context?.campaign, fromName });
            }}
          />
          <FormErrorMessage>
            Le nom de l'expéditeur est obligatoire !
          </FormErrorMessage>
        </FormControl>
      </Flex>

      <FormControl mb={8} isInvalid={!!errors.subject}>
        <FormLabel>Objet</FormLabel>
        <Input
          {...register("subject", { required: true })}
          defaultValue={context?.campaign?.subject}
          readOnly={disabled}
          placeholder="Enquête de satisfaction"
          onChange={(e) => {
            const subject = e.target.value;
            context?.setCampaign({ ...context?.campaign, subject });
          }}
        />
        <FormErrorMessage>Le sujet du mail est obligatoire !</FormErrorMessage>
      </FormControl>

      <FormControl mb={8} isInvalid={!!errors.body}>
        <FormLabel>Votre message</FormLabel>
        <Flex gap={2} mt={4} mb={4}>
          <Button
            size={"sm"}
            fontWeight={500}
            colorScheme="pink"
            onClick={() => addMailParam("@Prénom_client")}
          >
            @Prénom_client
          </Button>
          <Button
            size={"sm"}
            fontWeight={500}
            colorScheme="facebook"
            onClick={() => addMailParam(currentRestaurant?.name || "")}
          >
            @Nom_Etablissement
          </Button>
        </Flex>
        <Textarea
          id="body"
          {...register("body", { required: true })}
          defaultValue={
            context?.campaign?.body ||
            "Bonjour @Prénom_client," +
              "\n" +
              "\n" +
              "Merci pour votre passage à @Nom_Etablissement." +
              "\n" +
              "\n" +
              "Dites-nous comment s'est passé votre expérience ?"
          }
          height={"200px"}
          readOnly={disabled}
          placeholder={
            "Bonjour @Prénom_client," +
            "\n" +
            "\n" +
            "Merci pour votre passage à @Nom_Etablissement." +
            "\n" +
            "\n" +
            "Dites-nous comment s'est passé votre expérience ?"
          }
          onChange={(e) => {
            const body = e.target.value;
            context?.setCampaign({ ...context?.campaign, body });
          }}
        />
        <FormErrorMessage>Le corps du mail est obligatoire !</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>URL de redirection</FormLabel>
        <InputGroup size="sm">
          <InputLeftAddon>https://</InputLeftAddon>
          <Input
            {...register("url", { required: false })}
            defaultValue={context?.campaign?.url}
            readOnly={disabled}
            placeholder="monsite.fr"
            onChange={(e) => {
              const url = e.target.value;
              context?.setCampaign({ ...context?.campaign, url });
            }}
          />
        </InputGroup>
      </FormControl>
    </Box>
  );
};

export default MailStep;
