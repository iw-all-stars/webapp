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
import { type Campaign, type Client } from "@prisma/client";
import Stepper from "../../stepper";
import { useSteps } from "@chakra-ui/stepper";
import MailStep from "./steps/mail";
import RecipientStep from "./steps/recipient";
import { api } from "~/utils/api";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { CampaignContext } from "../CampaignContext";
import StatsStep from "./steps/stats";
import { z } from "zod";

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

export const campaignStep1 = z.object({
    name: z.string().min(1),
});

export const campaignStep2 = z.object({
    fromName: z.string().min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
    url: z.string().url()
});

campaignStep2.pick

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

    const [selectAllRecipients, setSelectAllRecipients] = useState(true);

    // list of clients ID to include in the campaign (if selectAllRecipients is false)
    const [includeClients, setIncludeClients] = React.useState<string[]>([]);
    // list of clients ID to exclude from the campaign (if selectAllRecipients is true)
    const [excludeClients, setExcludeClients] = React.useState<string[]>([]);

    const initializeCampaign = api.campaign.initializeCampaign.useMutation();
    const updateCampaign = api.campaign.updateCampaign.useMutation();
    const sendCampaign = api.mail.sendCampaign.useMutation();
    const router = useRouter();

	const sendCampaignToClients = () => {
        const campaignId = context?.campaign?.id;
        if (!campaignId) {
            return;
        }

        // if selectAllRecipients is true, we send the campaign to all clients except the ones in excludeClients
        // if selectAllRecipients is false, we send the campaign to the clients in includeClients
        const data = {
            campaignId,
            includeClients: selectAllRecipients ? undefined : includeClients,
            excludeClients: selectAllRecipients ? excludeClients : undefined,
            selectAllRecipients,
        };

        sendCampaign.mutate(data, {
            onSuccess: () => {
                close();
            },
            onError: (error) => {
                setError(error.message);
            },
        });
    };

    const close = useCallback(() => {
        onClose();
        setError(undefined);
        setActiveStep(0);
        setIsSaved(false);
        initializeCampaign.reset();
        updateCampaign.reset();
        sendCampaign.reset();
    }, [
        onClose,
        setActiveStep,
        initializeCampaign,
        updateCampaign,
        sendCampaign,
    ]);

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

    const renderSteps = () => {
        const steps = new Map<number, React.ReactNode>([
            [
                0,
                <CampaignStep
                    key={0}
                    disabled={disabled}
                    initialRef={initialRef}
                />,
            ],
            [1, <MailStep key={1} disabled={disabled} />],
            [
                2,
                <RecipientStep
                    key={2}
                    isCampaignSent={
                        context?.campaign?.status?.toLowerCase() === "sent"
                    }
                    selectAllRecipients={selectAllRecipients}
                    setSelectAllRecipients={setSelectAllRecipients}
                    includeClients={includeClients}
                    setIncludeClients={setIncludeClients}
                    excludeClients={excludeClients}
                    setExcludeClients={setExcludeClients}
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
            return sendCampaignToClients();
        }

        // If no campaign id and basic details are present, create a new campaign
        if (!context?.campaign?.id && context?.campaign?.name) {
            const campaign = {
                name: context?.campaign.name,
                restaurantId: router.query.restaurantId as string,
                template: Number(5), // Change this to the template id from env
            };

            const newCampaign = await initializeCampaign.mutateAsync(campaign);

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
                url: url ? url : undefined,
            };

            if (campaign.status === "draft") {
                updateCampaign.mutate(campaign);
            }

            goToNext();
        }
    };

    const canGoNextStep = (step: number, camp?: Partial<Campaign>) => {
        switch (step) {
            case 0:
                return campaignStep1.safeParse(camp).success;
            case 1:
                return campaignStep2.safeParse(camp).success;
            case 2:
                return true;
            default:
                return false;
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
                                <Text fontSize={13}>
                                    Sauvegarde en cours...
                                </Text>
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
                            (context?.campaign?.status === "sent" &&
                                !lastStep)) && (
                            <Button
                                colorScheme={lastStep ? "green" : "blue"}
                                mr={3}
                                onClick={save}
								isDisabled={!canGoNextStep(activeStep, context?.campaign)}
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
