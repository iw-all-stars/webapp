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

export default function Navbar() {

  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <Flex
      px={8}
      py={7}
      alignItems="center"
      justifyContent="space-between"
      borderBottom="1px solid black"
    >
      <Link href="/">
        <Box>Logo</Box>
      </Link>
      <Menu placement="bottom-end">
        <MenuButton
          as={Button}
          variant="ghost"
          colorScheme="gray"
          rightIcon={<ChevronDownIcon />}
        >
          <Flex alignItems="center" justifyContent="space-between" gap={2}>
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
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => router.push("/notifications")}>
            <Flex w="full" alignItems="center" justifyContent="space-between">
              <Text>Notifications</Text>
              <Icon as={GoBell} w={5} h={5} />
            </Flex>
          </MenuItem>
          <MenuItem onClick={() => signOut()}>
            <Flex w="full" alignItems="center" justifyContent="space-between">
              <Text>Déconnexion</Text>
              <Icon as={GoSignOut} w={5} h={5} color="red.500" />
            </Flex>
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
