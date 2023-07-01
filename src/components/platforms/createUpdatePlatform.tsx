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
} from "@chakra-ui/react";
import { type Platform, type PlatformKey } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type createUpdatePlatformParams } from "~/pages/dashboard/[organizationId]/restaurant/[restaurantId]/platforms";

interface CreateUpdatePlatformProps {
    platformKey: PlatformKey;
    platform?: Omit<Platform, 'password'>;
    createUpdatePlatform: (data: createUpdatePlatformParams) => void;
    isLoadingCreateUpdatePlatform: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const CreateUpdatePlatform = ({
    platformKey,
    createUpdatePlatform,
    isLoadingCreateUpdatePlatform,
    platform,
    isOpen,
    onClose,
}: CreateUpdatePlatformProps) => {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
        reset,
        setError,
        setValue,
    } = useForm<Pick<Platform, "login" | "password">>({
        defaultValues: {
            login: platform?.login ?? "",
        },
    });

    useEffect(() => {
        setValue("login", platform ? platform.login : "");
    }, [platform]);

    const submit = (dataForm: Pick<Platform, "login" | "password">) => {
        createUpdatePlatform({
            dataForm,
            key: platformKey,
            platform,
            options: {
                onSuccess: () => {
                    onClose();
                    reset();
                },
                onError: (e: any) => {
                    // set errors
                    setError("login", {
                        type: "manual",
                        message:
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            e?.data?.httpStatus === 401
                                ? "Mauvais identifiants"
                                : "Une erreur inconnue est survenue",
                    });

                    setError("password", {
                        type: "manual",
                        message:
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            e?.data?.httpStatus === 401
                                ? "Mauvais identifiants"
                                : "Une erreur inconnue est survenue",
                    });
                },
            },
        });
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
                                    autoComplete="none"
                                    isDisabled={!!platform}
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
                                        autoComplete="off"
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
                                isLoading={isLoadingCreateUpdatePlatform}
                                type="submit"
                            >
                                {platform
                                    ? "Enregistrer"
                                    : "Connecter"}
                            </Button>
                            <Button
                                onClick={() => {
                                    onClose();
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateUpdatePlatform;
