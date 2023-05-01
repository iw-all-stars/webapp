import React from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { signIn } from "next-auth/react";

import { Button, Container } from "@chakra-ui/react";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const addCampaign = api.campaign.createCampaign.useMutation({});
  const getCampaign = api.campaign.getCampaigns.useQuery();

  const handleExample = () => {
    addCampaign.mutate({
      name: "Example",
      type: "CPC",
    });
  };

  const handleGetCampaign = React.useCallback(() => {
    getCampaign.refetch();
  }, [getCampaign]);

  return (
    <>
      <Button onClick={() => signIn()}>Sign in</Button>
      <Button onClick={() => handleExample()}>Add Example</Button>
      <Button onClick={handleGetCampaign}>Get Example</Button>
      <p>{getCampaign.data?.map((campaign) => campaign.name).join(", ")}</p>
    </>
  );
};

export default Home;
