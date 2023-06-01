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
import React, { useEffect, useState } from "react";
import CampaignStep from "./steps/campaign";
import { type Client, type Campaign } from "@prisma/client";
import { type SubmitHandler } from "react-hook-form";
import Stepper from "../stepper";
import { useSteps } from "@chakra-ui/stepper";
import MailStep from "./steps/mail";
import RecipientStep from "./steps/recipient";
import { api } from "~/utils/api";
import { type Row, type Column } from "react-table";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

interface ICampaignModal {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign;
}

export type FormValues = {
  name?: string;
  typeId?: string;
  subject?: string;
  body?: string;
  url?: string;
};

export interface Columns {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

export type Recipient = Client & { selected: boolean };

export const CampaignModal = ({
  isOpen,
  onClose,
  campaign,
}: ICampaignModal) => {
  const steps = [
    { title: "Campagne" },
    { title: "Message" },
    { title: "Cibles" },
  ];

  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  const { activeStep, setActiveStep, goToPrevious, goToNext } = useSteps({
    index: 0,
    count: steps.length,
  });

  const edit = !!campaign;
  const isDraft = campaign?.status.toLowerCase() === "draft";
  const disabled = !isDraft && edit;
  const lastStep = activeStep === 2;

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [_campaign, setCampaign] = useState<Partial<Campaign>>();
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const handleCampaign: SubmitHandler<FormValues> = (values: FormValues) => {
    setCampaign({ ..._campaign, ...values });
  };

  const customers = api.customer.getClients.useQuery();
  const updateCampaign = api.campaign.updateCampaign.useMutation();
  const sendCampaign = api.mail.sendCampaign.useMutation();

  const sendCampaignToRecipients = React.useCallback(() => {
    if (!recipients.length || !campaign) return;
    const selectedRecipients = recipients.filter(
      (recipient) => recipient.selected
    );
    const data = {
      campaignId: campaign.id,
      recipientIds: selectedRecipients.map((recipient) => recipient.id),
    };
    sendCampaign.mutate(data);
  }, [recipients, campaign]);

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
  }, [updateCampaign.isSuccess]);

  useEffect(() => {
    if (updateCampaign.isLoading) {
      setIsSaving(true);
    }
  }, [updateCampaign.isLoading]);

  useEffect(() => {
    if (sendCampaign.isSuccess) {
      setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
      }, 300);
    }
  }, [sendCampaign.isSuccess]);

  useEffect(() => {
    if (sendCampaign.isLoading) {
      setIsSending(true);
    }
  }, [sendCampaign.isLoading]);

  useEffect(() => {
    if (sendCampaign.isError) {
      setError(sendCampaign.failureReason?.message as unknown as string);
      setIsSending(false);
      setIsSent(false);
    }
  }, [sendCampaign.isError]);

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
      [
        0,
        <CampaignStep
          key={0}
          campaign={campaign}
          disabled={disabled}
          initialRef={initialRef}
          on={{ handleCampaign, setCampaign }}
        />,
      ],
      [
        1,
        <MailStep
          key={1}
          campaign={campaign}
          disabled={disabled}
          setCampaign={setCampaign}
        />,
      ],
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

  const save = () => {
    if (lastStep) {
      sendCampaignToRecipients();
      
    } else {
      goToNext();
      if (!_campaign) return;
      const { id, name, typeId, status, subject, body, url } = _campaign;
      if (!id || !name || !typeId || !status) return;
      const campaign = {
        id,
        name,
        typeId,
        status,
        subject,
        body,
        url,
      };
      if (campaign.status === "draft") {
        updateCampaign.mutate(campaign);
      }
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
          {edit ? campaign.name : "Nouvelle campagne"}
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
              <Button colorScheme="blue" mr={3} onClick={() => {
                goToPrevious();
                setIsSaved(false);
              }}>
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
