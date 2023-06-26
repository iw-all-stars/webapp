/* eslint-disable @typescript-eslint/unbound-method */
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import CampaignStep from "./steps/campaign";
import { type Client } from "@prisma/client";
import Stepper from "../../stepper";
import { useSteps } from "@chakra-ui/stepper";
import MailStep from "./steps/mail";
import RecipientStep from "./steps/recipient";
import { api } from "~/utils/api";
import { type Row, type Column } from "react-table";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { CampaignContext } from "../CampaignContext";
import { env } from "~/env.mjs";

interface ICampaignModal {
  isOpen: boolean;
  onClose: () => void;
}

export type FormValues = {
  name?: string;
  subject?: string;
  body?: string;
  url?: string;
  fromName?: string;
  fromEmail?: string;
};

export interface Columns {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

export type Recipient = Client & { selected: boolean };

export const CampaignModal = ({ isOpen, onClose }: ICampaignModal) => {
  const steps = [
    { title: "Campagne" },
    { title: "Message" },
    { title: "Clients" },
  ];

  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  const { activeStep, setActiveStep, goToPrevious, goToNext } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [edit, setEdit] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [lastStep, setLastStep] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const context = useContext(CampaignContext);

  const customers = api.customer.getClients.useQuery();
  const createCampaign = api.campaign.createCampaign.useMutation();
  const updateCampaign = api.campaign.updateCampaign.useMutation();
  const sendCampaign = api.mail.sendCampaign.useMutation();
  const router = useRouter();

  useEffect(() => {
    setEdit(!!context?.campaign?.id);
    setDisabled(
      context?.campaign?.status?.toLowerCase() !== "draft" &&
        context?.campaign?.id !== undefined
    );
  }, [context?.campaign]);

  useEffect(() => {
    setLastStep(activeStep === 2);
  }, [activeStep]);

  useEffect(() => {
    customers.refetch();
  }, []);

  useEffect(() => {
    if (updateCampaign.isSuccess) {
      setTimeout(() => {
        setIsSaving(false);
        setIsSaved(true);
      }, 300);
    }

    if (updateCampaign.isLoading) {
      setIsSaving(true);
    }
  }, [updateCampaign]);

  useEffect(() => {
    if (sendCampaign.isSuccess) {
      setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
      }, 300);
    }

    if (sendCampaign.isLoading) {
      setIsSending(true);
    }

    if (sendCampaign.isError) {
      setError(sendCampaign.failureReason?.message as unknown as string);
      setIsSending(false);
      setIsSent(false);
    }
  }, [sendCampaign]);

  const sendCampaignToClients = React.useCallback(
    (recipients: Recipient[]) => {
      const selectedRecipients = recipients.filter(
        (recipient) => recipient.selected
      );

      const campaignId = context?.campaign?.id;
      if (!campaignId) {
        return;
      }

      const data = {
        campaignId,
        recipientIds: selectedRecipients.map((recipient) => recipient.id),
      };

      sendCampaign.mutate(data);
    },
    [context?.campaign?.id, sendCampaign]
  );

  const data = React.useMemo(() => {
    if (!customers?.data) return [];
    const Recipients = customers?.data;
    return Recipients as unknown as Row<object>[];
  }, [customers?.data]);

  const columns: Column<object>[] = React.useMemo(
    () => [
      {
        Header: "Nom",
        accessor: "name" as keyof Columns,
      },
      {
        Header: "Prénom",
        accessor: "firstname" as keyof Columns,
      },
      {
        Header: "Email",
        accessor: "email" as keyof Columns,
      },
      {
        Header: "Envoi",
        accessor: "selected" as keyof Columns,
      },
    ],
    []
  );

  const renderSteps = () => {
    const steps = new Map<number, React.ReactNode>([
      [0, <CampaignStep key={0} disabled={disabled} initialRef={initialRef} />],
      [1, <MailStep key={1} disabled={disabled} />],
      [
        2,
        <RecipientStep
          key={2}
          columns={columns}
          data={data}
          recipients={recipients}
          setRecipients={setRecipients}
        />,
      ],
    ]);

    return steps.get(activeStep);
  };

  const save = async () => {
    if (lastStep) {
      sendCampaignToClients(recipients);
      return; // If it's the last step, we're done here
    }

    // If no campaign id and basic details are present, create a new campaign
    if (!context?.campaign?.id && context?.campaign?.name) {
      const campaign = {
        name: context?.campaign.name,
        restaurantId: router.query.restaurantId as string,
        template: Number(env.NEXT_PUBLIC_MAIL_TEMPLATE_CAMPAIGN_ID),
        subject: context?.campaign.subject || "",
        body: context?.campaign.body || "",
        url: context?.campaign.url || "",
      };

      const newCampaign = await createCampaign.mutateAsync(campaign);

      if (newCampaign?.id) {
        context?.setCampaign(newCampaign);
        goToNext();
      }
      return;
    }

    // If campaign id exists, validate necessary details and update the campaign if it's a draft
    if (
      context?.campaign?.id &&
      context?.campaign?.name &&
      context?.campaign?.status
    ) {
      const { id, name, status, subject, body, url } = context?.campaign;

      const campaign = {
        id,
        name,
        status,
        subject,
        body,
        url,
      };

      if (campaign.status === "draft") {
        updateCampaign.mutate(campaign);
      }

      goToNext();
    }
  };

  const close = () => {
    onClose();
    setActiveStep(0);
    setIsSaved(false);
    setIsSent(false);
    setError(undefined);
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={close}
      size="5xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader noOfLines={2}>
          {edit ? context?.campaign?.name : "Nouvelle campagne"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <Box w="100%">
            <Stepper
              steps={steps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
            <br />
            {renderSteps()}
          </Box>
        </ModalBody>

        <ModalFooter justifyContent={"space-between"}>
          <Box>
            {isSaving && (
              <Flex alignItems={"center"} gap={2}>
                <Spinner color="orange.500" />
                <Text fontSize={13}>Sauvegarde en cours...</Text>
              </Flex>
            )}
            {!isSaving && isSaved && (
              <Flex alignItems={"center"} gap={2}>
                <CheckIcon color="green.500" />
                <Text fontSize={13}>Sauvegarde réussie</Text>
              </Flex>
            )}
            {isSending && (
              <Flex alignItems={"center"} gap={2}>
                <Spinner color="orange.500" />
                <Text fontSize={13}>Envoi en cours...</Text>
              </Flex>
            )}
            {!isSending && isSent && !error && (
              <Flex alignItems={"center"} gap={2}>
                <CheckIcon color="green.500" />
                <Text fontSize={13}>Campagne envoyée</Text>
              </Flex>
            )}
            {error && (
              <Flex alignItems={"center"} gap={2}>
                <CloseIcon color="red.500" />
                <Text fontSize={13}>{error}</Text>
              </Flex>
            )}
          </Box>
          <Box>
            {activeStep > 0 && (
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  goToPrevious();
                  setIsSaved(false);
                }}
              >
                Précedent
              </Button>
            )}
            <Button
              colorScheme={lastStep ? "green" : "blue"}
              mr={3}
              onClick={save}
            >
              {lastStep ? "Envoyer" : "Suivant"}
            </Button>
            <Button onClick={close}>Fermer</Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CampaignModal;
