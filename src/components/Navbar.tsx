import { Box, Flex, Image, Skeleton, SkeletonCircle, Text, Icon } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { GoSignOut } from "react-icons/go";


export default function Navbar() {

  const { data: session, status } = useSession();

  return (
    <Flex px={8} py={7} alignItems="center" justifyContent="space-between" borderBottom="1px solid black">
      <Box>Logo</Box>
      <Flex alignItems="center" gap={6}>
        Links
        <Flex alignItems="center" gap={4}>
          <SkeletonCircle h={10} w={10} rounded="full" isLoaded={status !== "loading"}>
            <Image h={10} w={10} rounded="full" src={session?.user?.image ?? ""} alt="User profile image" />
          </SkeletonCircle>
          <Skeleton isLoaded={status !== "loading"} h={6}>
            <Text minW={28}>{session?.user.name}</Text>
          </Skeleton>
          <Icon as={GoSignOut} w={6} h={6} mt={1} color="red.600" cursor="pointer" onClick={() => signOut()} />
        </Flex>
      </Flex>
    </Flex>
  )
}
