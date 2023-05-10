import { type NextPage } from "next";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";

const DashboardHome: NextPage = () => {

  const router = useRouter();

  return (
    <Box h="full" w="full" pt={8}>
      Organization {router.query.organizationId}
    </Box>
  );
};

export default DashboardHome;
