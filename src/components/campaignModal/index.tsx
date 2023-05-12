import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import CampaignStep from "./steps/campaign";
import { Campaign } from "@prisma/client";
import { SubmitHandler } from "react-hook-form";
import Stepper from "../stepper";
import { useSteps } from "@chakra-ui/stepper";
import MailStep from "./steps/mail";
import RecipientStep from "./steps/recipient";
import { api } from "~/utils/api";

interface ICampaignModal {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any;
}

export type FormValues = {
  name?: string;
  typeId?: string;
  subject?: string;
  body?: string;
  url?: string;
};

export const CampaignModal = ({
  isOpen,
  onClose,
  campaign,
}: ICampaignModal) => {
  const steps = [
    { title: "Campagne" },
    { title: "Courrier" },
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

  const [_campaign, setCampaign] = useState<Partial<Campaign> | null>(null);

  const handleCampaign: SubmitHandler<FormValues> = async (
    values: FormValues
  ) => {
    setCampaign({ ..._campaign, ...values });
  };

  const clients = api.clients.getClients.useQuery();

  useEffect(() => {
    clients.refetch();
  }, []);

  const data = React.useMemo(() => clients?.data || [], [clients]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Prénom",
        accessor: "firstname",
      },
      {
        Header: "Nom",
        accessor: "name",
      },
      {
        Header: "E-mail",
        accessor: "email",
      },
    ],
    []
  );

  const renderSteps = () => {
    const steps = new Map<number, React.ReactNode>([
      [
        0,
        <CampaignStep
          campaign={campaign}
          disabled={disabled}
          initialRef={initialRef}
          on={{ handleCampaign, setCampaign }}
        />,
      ],
      [
        1,
        <MailStep
          campaign={campaign}
          disabled={disabled}
          handleCampaign={handleCampaign}
        />,
      ],
      [2, <RecipientStep columns={columns} data={data} isFetching={clients?.isFetching} />],
    ]);

    return steps.get(activeStep);
  };

  const save = () => {
    if (lastStep) {
      onClose();
      setActiveStep(0);
    } else {
      goToNext();
    }
  };

  const close = () => {
    onClose();
    setActiveStep(0);
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={close}
      size="3xl"
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

        <ModalFooter>
          {activeStep > 0 && (
            <Button colorScheme="blue" mr={3} onClick={goToPrevious}>
              Précedent
            </Button>
          )}
          <Button
            colorScheme={lastStep ? "green" : "blue"}
            mr={3}
            onClick={save}
          >
            {lastStep ? "Enregistrer" : "Suivant"}
          </Button>
          <Button onClick={close}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CampaignModal;
