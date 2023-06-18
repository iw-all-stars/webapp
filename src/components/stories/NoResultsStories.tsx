import {
	Box,
	Text
} from "@chakra-ui/react";

export const NoResultsStories = () => {
    return (
        <Box
            h="full"
			w="full"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
        >
            <Box
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap="4"
            >
                <Text fontSize="lg" fontWeight="bold">
                    Pas de stories par ici ...
                </Text>
                <Text fontSize="sm" color="gray.500">
                    Créez votre story sur une plateforme ou changez les filtres
                </Text>
            </Box>
        </Box>
    );
};
