/* eslint-disable @typescript-eslint/no-misused-promises */
import {
	Avatar,
	Box,
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	useDisclosure
} from "@chakra-ui/react";
import { type Platform, type PlatformKey } from "@prisma/client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/utils/api";

interface CreateUpdatePlatformProps {
    platformKey: PlatformKey;
    platform?: Platform;
    createUpdatePlatform: (
        dataForm: Pick<Platform, "login" | "password">,
        key: PlatformKey,
        platform?: Platform
    ) => void;
    isOpen: boolean;
    onClose: () => void;
}

const CreateUpdatePlatform = ({
    platformKey,
    createUpdatePlatform,
    platform,
    isOpen,
    onClose,
}: CreateUpdatePlatformProps) => {
    const {
        isOpen: isOpenAlert,
        onOpen: onOpenAlert,
        onClose: onCloseAlert,
    } = useDisclosure();
    const cancelRef = React.useRef<HTMLInputElement>(null);

    const utils = api.useContext();

    const {
        handleSubmit,
        register,
        setValue,
        formState: { errors, isSubmitting },
        watch,
        getValues,
        resetField,
        reset,
    } = useForm<Pick<Platform, "login" | "password">>({
        defaultValues: {
            login: platform?.login || "",
        },
    });

    const submit = (dataForm: Pick<Platform, "login" | "password">) => {
        createUpdatePlatform(dataForm, platformKey, platform);
        reset();
		onClose();
    };

    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    return (
        <Modal
            size="xl"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={() => {
				onClose();
				reset();
			}}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Avatar
                        size="sm"
                        name="Dan Abrahmov"
                        marginRight="2"
                        src={`/${platformKey.toLowerCase()}.png`}
                    />
                    {platform
                        ? "Modifier la plateforme"
                        : `Connecter un compte ${platformKey.toLocaleLowerCase()}`}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={handleSubmit(submit)}>
                        <Box display="flex" flexDirection="column" gap="4">
                            <FormControl isInvalid={!!errors.login}>
                                <FormLabel htmlFor="login">Login</FormLabel>
                                <Input
                                    id="login"
                                    placeholder="login"
                                    {...register("login", {
                                        required: "Login is required",
                                    })}
                                />
                                <FormErrorMessage>
                                    {errors.login && errors.login.message}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.login}>
                                <FormLabel htmlFor="password">
                                    Mot de passe
                                </FormLabel>
                                <InputGroup size="md">
                                    <Input
                                        id="password"
                                        placeholder="password"
                                        pr="4.5rem"
                                        type={show ? "text" : "password"}
                                        {...register("password", {
                                            required: "Password is required",
                                        })}
                                    />
                                    <InputRightElement width="4.5rem">
                                        <Button
                                            h="1.75rem"
                                            size="sm"
                                            onClick={handleClick}
                                        >
                                            {show ? "Hide" : "Show"}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                <FormErrorMessage>
                                    {errors.login && errors.login.message}
                                </FormErrorMessage>
                            </FormControl>
                        </Box>
                        <Box display="flex" justifyContent="end" marginTop="4">
                            <Button
                                colorScheme="blue"
                                mr={3}
                                isLoading={isSubmitting}
                                type="submit"
                            >
                                {platform ? "Enregistrer" : "Connecter"}
                            </Button>
                            <Button onClick={() => {
								onClose();
								reset();
							}}>Cancel</Button>
                        </Box>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateUpdatePlatform;
