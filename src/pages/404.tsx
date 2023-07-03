import { Box, Button, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Custom404() {

	const router = useRouter();

    return (
        <Box
            h="full"
            w="full"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Flex direction="column" alignItems="center" justifyContent="center" gap={4}>
                <Image src="/assets/Error1.svg" width={50} height={50} alt="" />
                <Text fontWeight="semibold">
                    Oops ! Il n'y a pas l'air d'avoir grand chose par ici
                </Text>
				<Button onClick={() => router.push("/")} colorScheme="teal">Retourner à l'accueil</Button>
            </Flex>
        </Box>
    );
}
