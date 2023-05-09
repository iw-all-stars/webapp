import React from "react";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { Button, Flex, Skeleton, SkeletonCircle, Text, Image, Box, Grid, GridItem } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const DashboardHome: NextPage = () => {

  const router = useRouter();
  const utils = api.useContext();

  const { data: session, status: sessionStatus } = useSession();

  const organizations = api.organization.getByUserId.useQuery();

  return (
    <Box h="full" w="full" pt={8}>
      Organization {router.query.organizationId}
    </Box>
  );
};

export default DashboardHome;
