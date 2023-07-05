import { Box, Text, Image } from "@chakra-ui/react";

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
                <Image src="/assets/Error1.svg" width={50} height={50} alt="" />
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
