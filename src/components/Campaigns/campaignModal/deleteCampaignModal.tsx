import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import { api } from "~/utils/api";

interface DeleteCampaignModalProps {
    campaignId: string;
}

export const DeleteCampaignModal = ({
    campaignId,
}: DeleteCampaignModalProps) => {
    const cancelRef = useRef<HTMLInputElement>(null);

	const utils = api.useContext();

    const { isLoading: isLoadingDeleteCampaign, mutate: mutateDeleteCampaign } =
        api.campaign.deleteCampaign.useMutation({
			onSuccess: () => {
				utils.campaign.getCampaigns.invalidate();
				utils.campaign.getCountCampaigns.invalidate();
				onCloseDeleteCampaign();
			}
		});

    const {
        isOpen: isOpenDeleteCampaign,
        onOpen: onOpenDeleteCampaign,
        onClose: onCloseDeleteCampaign,
    } = useDisclosure();
    return (
        <>
            <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={onOpenDeleteCampaign}
            >
                Supprimer
            </Button>
            <AlertDialog
                isOpen={isOpenDeleteCampaign}
                leastDestructiveRef={cancelRef}
                onClose={onCloseDeleteCampaign}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            <Box display="flex" alignItems="center">
                                Supprimer le restaurant
                            </Box>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Êtes-vous sûr ? Vos stories ansi que vos campagnes
                            et clients seront supprimées.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={onCloseDeleteCampaign}>
                                Annuler
                            </Button>
                            <Button
                                isLoading={isLoadingDeleteCampaign}
                                colorScheme="red"
                                ml={3}
                                onClick={() => {
                                    mutateDeleteCampaign({
                                        id: campaignId,
                                    });
                                }}
                            >
                                Supprimer quand même
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};
