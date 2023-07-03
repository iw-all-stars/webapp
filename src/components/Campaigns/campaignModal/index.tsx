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
import React, { useCallback, useContext, useEffect, useState } from "react";
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
import StatsStep from "./steps/stats";

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
  const context = useContext(CampaignContext);

  const steps = [
    { title: "Campagne" },
    { title: "Message" },
    { title: "Clients" },
    ...(context?.campaign?.status === "sent"
      ? [{ title: "Statistiques" }]
      : []),
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
  const [search, setSearch] = useState<string | undefined>(undefined);

  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const customers = api.customer.getClients.useQuery({
    input: search,
  });
  const createCampaign = api.campaign.createCampaign.useMutation();
  const updateCampaign = api.campaign.updateCampaign.useMutation();
  const sendCampaign = api.mail.sendCampaign.useMutation();
  const sentEmails = api.mail.getMails.useQuery(context?.campaign?.id);
  const router = useRouter();

  const close = useCallback(() => {
    onClose();
    setError(undefined);
    setActiveStep(0);
    setIsSaved(false);
    setRecipients([]);
    createCampaign.reset();
    updateCampaign.reset();
    sendCampaign.reset();
  }, [onClose, setActiveStep, createCampaign, updateCampaign, sendCampaign]);

  useEffect(() => {
    setEdit(!!context?.campaign?.id);
    setDisabled(
      context?.campaign?.status?.toLowerCase() !== "draft" &&
        context?.campaign?.id !== undefined
    );
  }, [context?.campaign]);

  useEffect(() => {
    setLastStep(activeStep === steps.length - 1);
  }, [activeStep]);

  useEffect(() => {
    if (context?.campaign?.id && context?.campaign?.status === "sent") {
      setActiveStep(3);
    }
  }, [context?.campaign?.id, context?.campaign?.status]);

  useEffect(() => {
    customers.refetch();
    setIsSending(false);
  }, [isOpen]);

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

  useEffect(() => {
    const debounce = setTimeout(() => {
      customers?.refetch();
    }, 2000);
    return () => clearTimeout(debounce);
  }, [search]);

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

      sendCampaign.mutate(data, {
        onSuccess: () => {
          close();
        },
        onError: (error) => {
          setError(error.message);
        },
      });
    },
    [context?.campaign?.id, sendCampaign]
  );

  const data = React.useMemo(() => {
    if (!customers?.data) return [];
    if (context?.campaign?.id && context?.campaign?.status === "draft") {
      const Recipients = customers?.data;
      return Recipients as unknown as Row<object>[];
    } else {
      const sentEmail = sentEmails?.data;
      const Recipients = sentEmail?.map((email) => email.client);
      return Recipients as unknown as Row<object>[];
    }
  }, [customers?.data, sentEmails?.data, context?.campaign?.id]);

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
          sent={
            sentEmails && sentEmails?.data && sentEmails?.data?.length > 0
              ? true
              : false
          }
          columns={columns}
          data={data}
          recipients={recipients}
          setRecipients={setRecipients}
          setSearch={setSearch}
        />,
      ],
    ]);

    if (context?.campaign?.id && context?.campaign?.status === "sent") {
      steps.set(3, <StatsStep key={context?.campaign?.id} />);
    }
    return steps.get(activeStep);
  };

  const save = async () => {
    if (lastStep) {
      return sendCampaignToClients(recipients);
    }

    // If no campaign id and basic details are present, create a new campaign
    if (!context?.campaign?.id && context?.campaign?.name) {
      const campaign = {
        name: context?.campaign.name,
        restaurantId: router.query.restaurantId as string,
        template: Number(5),
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
            {error && !isSending && (
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
            {(context?.campaign?.status !== "sent" ||
              (context?.campaign?.status === "sent" && !lastStep)) && (
              <Button
                colorScheme={lastStep ? "green" : "blue"}
                mr={3}
                onClick={save}
              >
                {lastStep ? "Envoyer" : "Suivant"}
              </Button>
            )}
            <Button onClick={close}>Fermer</Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CampaignModal;
