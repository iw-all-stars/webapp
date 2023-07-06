import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Textarea
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { campaignStep2, type FormValues } from "..";
import { CampaignContext } from "../../CampaignContext";

interface MailProps {
  disabled: boolean;
}

export const MailStep = ({ disabled }: MailProps) => {
  const {
    register,
	watch,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
  });
  const context = useContext(CampaignContext);

  useEffect(() => {
	const subscription = watch((values) => {
		context?.setCampaign({
			...context?.campaign,
			...values
		})
	});
	return () => subscription.unsubscribe();
}, [watch]);

  

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
        <FormControl isInvalid={dirtyFields.fromName && !campaignStep2.pick({ fromName: true }).safeParse(
		{ fromName: context?.campaign?.fromName}
	  ).success}>
          <FormLabel>De la part de (@Nom_Etablissement)</FormLabel>
          <Input
            {...register("fromName", { required: true })}
            defaultValue={currentRestaurant?.name}
            readOnly={disabled}
          />
          <FormErrorMessage>
            Le nom de l'expéditeur est obligatoire !
          </FormErrorMessage>
        </FormControl>
      </Flex>

      <FormControl mb={8} isInvalid={dirtyFields.subject && !campaignStep2.pick({ subject: true }).safeParse(
		{ subject: context?.campaign?.subject}
	  ).success}>
        <FormLabel>Objet</FormLabel>
        <Input
          {...register("subject", { required: true })}
          defaultValue={context?.campaign?.subject}
          readOnly={disabled}
          placeholder="Enquête de satisfaction"
        />
        <FormErrorMessage>Le sujet du mail est obligatoire !</FormErrorMessage>
      </FormControl>

      <FormControl mb={8} isInvalid={dirtyFields.body && !campaignStep2.pick({ body: true }).safeParse(
		{ body: context?.campaign?.body}
	  ).success}>
        <FormLabel>Votre message</FormLabel>
        {!disabled && (
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
        )}
        <Textarea
          id="body"
          {...register("body", { required: true })}
          value={
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
        />
        <FormErrorMessage>Le corps du mail est obligatoire !</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={dirtyFields.url && !campaignStep2.pick({ url: true }).safeParse(
		{ url: context?.campaign?.url}
	  ).success}>
        <FormLabel>URL de redirection</FormLabel>
          <Input
            {...register("url", { required: false })}
            defaultValue={context?.campaign?.url}
            readOnly={disabled}
            placeholder="Entrez votre url google my business"
          />
		  <FormErrorMessage>Votre url de redirection n'est pas dans le bon format</FormErrorMessage>
      </FormControl>
    </Box>
  );
};

export default MailStep;
