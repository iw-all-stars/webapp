import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Box,
    Flex,
    Image,
    Skeleton,
    SkeletonCircle,
    Text,
    Icon,
    Menu,
    MenuButton,
    Button,
    MenuList,
    MenuItem,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GoSignOut, GoBell } from "react-icons/go";
import { DigidinerLogo } from "./logo/digidinerLogo.component";
import { api } from "~/utils/api";

export default function Navbar() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const { data: nbNotifs } =
        api.invitation.getByCurrentUserCount.useQuery();

    return (
        <Flex
            px={8}
            py={7}
            alignItems="center"
            justifyContent="space-between"
            borderBottom="1px"
            borderColor="teal.500"
        >
            <Link href="/">
                <DigidinerLogo width="120px" />
            </Link>
            <Menu placement="bottom-end">
                <MenuButton
                    position="relative"
                    as={Button}
                    variant="ghost"
                    colorScheme="gray"
                    rightIcon={<ChevronDownIcon />}
                >
                    <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                    >
                        <SkeletonCircle
                            h={30}
                            w={30}
                            rounded="full"
                            isLoaded={status !== "loading"}
                        >
                            <Image
                                h={30}
                                w={30}
                                rounded="full"
                                src={session?.user?.image ?? ""}
                                alt="User profile image"
                            />
                        </SkeletonCircle>
                        <Skeleton isLoaded={status !== "loading"} h={5}>
                            <Text minW={28}>{session?.user.name}</Text>
                        </Skeleton>
                    </Flex>
                    {nbNotifs && nbNotifs > 0 ? (
                        <Box
                            h={2}
                            w={2}
                            top="40%"
                            right="5px"
                            borderRadius="full"
                            bg="purple.500"
                            position="absolute"
                        ></Box>
                    ) : (
                        <></>
                    )}
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={() => router.push("/notifications")}>
                        <Flex
                            w="full"
                            alignItems="center"
                            justifyContent="space-between"
                            position="relative"
                        >
                            <Text>Notifications</Text>
                            <Icon as={GoBell} w={5} h={5} />
                            {nbNotifs && nbNotifs > 0 ? (
                                <Box
                                    h={2}
                                    w={2}
                                    top="40%"
                                    right="0"
                                    borderRadius="full"
                                    bg="purple.500"
                                    position="absolute"
                                ></Box>
                            ) : (
                                <></>
                            )}
                        </Flex>
                    </MenuItem>
                    <MenuItem onClick={() => signOut()}>
                        <Flex
                            w="full"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Text>Déconnexion</Text>
                            <Icon as={GoSignOut} w={5} h={5} color="red.500" />
                        </Flex>
                    </MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    );
}
