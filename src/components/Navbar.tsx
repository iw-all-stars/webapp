import { Box, Flex } from "@chakra-ui/react";


export default function Navbar() {
  return (
    <Flex px={8} py={7} justifyContent="space-between" borderBottom="1px solid black">
      <Box>Logo</Box>
      <Box>Links</Box>
    </Flex>
  )
}
