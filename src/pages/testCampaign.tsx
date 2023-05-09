import React from "react";
import { type NextPage } from "next";
import { Button } from "@chakra-ui/react";
import { api } from "~/utils/api";

const TestCampaign: NextPage = () => {
  const addCampaign = api.campaign.createCampaign.useMutation({});
  const getCampaign = api.campaign.getCampaigns.useQuery();

  const getClients = api.client.getClients.useQuery();
  const addClient = api.client.createClient.useMutation();
  const updateClient = api.client.updateClient.useMutation();

  const handleExample = () => {
    addCampaign.mutate({
      name: "Example",
      type: "CPC",
      template: 1,
      subject: "Example",
      body: "Example",
      url: "https://example.com",
    });
  };

  const handleGetCampaign = React.useCallback(() => {
    getCampaign.refetch();
  }, [getCampaign]);

  const handleGetClients = React.useCallback(() => {
    getClients.refetch();
  }, [getClients]);

  const handleClient = React.useCallback(() => {
    addClient.mutate({
      name: "Test",
      email: "test@gmail.com",
    });
  }, []);

  const handleUpdateClient = React.useCallback(() => {
    // find client id
    const clientId = getClients.data?.[0].id;
    if (!clientId) return;
  
    updateClient.mutate({
      id: clientId,
      name: "Test updated",
      email: "updated@gmail.com",
    });
  }, [getClients.data, updateClient]);

  return (
    <>
      <Button onClick={handleExample}>Add Example</Button>
      <Button onClick={handleGetCampaign}>Get Example</Button>
      <Button onClick={handleGetClients}>Get Clients</Button>
      <Button onClick={handleClient}>Create a Client</Button>
      <Button onClick={handleUpdateClient}>Update a Client</Button>
      <p>{getCampaign.data?.map((campaign) => campaign.name).join(", ")}</p>
      <p>{getClients.data?.map((client) => client.name).join(", ")}</p>
    </>
  );
};

export default TestCampaign;
