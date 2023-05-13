import React from "react";
import { type NextPage } from "next";
import { Button } from "@chakra-ui/react";
import { api } from "~/utils/api";

const TestCampaign: NextPage = () => {
  const getClients = api.clients.getClients.useQuery();
  const getCampaign = api.campaign.getCampaign.useQuery(
    "d0ebd2e6-3b7e-4d9c-8d3a-e05cad6baba4"
  );
  const getMails = api.mail.getMails.useQuery();

  const addCampaign = api.campaign.createCampaign.useMutation({});
  const addClient = api.clients.createClient.useMutation();
  const updateClient = api.clients.updateClient.useMutation();
  const createMail = api.mail.createMail.useMutation();
  const sendMail = api.mail.sendMail.useMutation();

  const handleExample = () => {
    addCampaign.mutate({
      name: "Example" + Math.random().toString(),
      typeId: "e58d69ea-0bf6-4686-85f9-09f203739957",
      template: 1,
      subject: "Example",
      body: "Example",
      url: "https://example.com",
      restaurantId: "ea6254ab-bde4-429f-83c6-4d63695feee0", // TODO: replace with restaurantId
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
      firstname: "Client-" + Math.random().toFixed(2) + "firstname",
      name: "Client-" + Math.random().toFixed(2),
      email: "client-" + Math.random().toFixed(2) + "@gmail.com",
    });
  }, []);

  const handleUpdateClient = React.useCallback(() => {
    const clientId = getClients.data?.[0]?.id;
    if (!clientId) return;

    updateClient.mutate({
      id: clientId,
      name: "Arizona",
      email: "test@gmail.com",
    });
  }, [getClients.data, updateClient]);

  const handleCreateMail = React.useCallback(() => {
    getCampaign.refetch();
    const campaignId = getCampaign.data?.id;
    const clientId = getClients.data?.[0]?.id;
    if (!campaignId || !clientId) return;

    createMail.mutate({
      campaignId: campaignId,
      clientId: clientId,
    });
    getMails.refetch();
  }, []);

  const handleSendMail = React.useCallback(() => {
    const mailId = getMails.data?.[0]?.id;
    if (!mailId) return;

    sendMail.mutate(mailId);
    getMails.refetch();
  }, [getMails]);

  return (
    <>
      <Button onClick={handleExample}>Add Campagne</Button>
      <Button onClick={handleGetCampaign}>Get Campagne</Button>
      <Button onClick={handleGetClients}>Get Clients</Button>
      <Button onClick={handleClient}>Create a Client</Button>
      <Button onClick={handleUpdateClient}>Update a Client</Button>
      <Button onClick={handleCreateMail}>Create a Mail</Button>
      <Button onClick={handleSendMail}>Send Mail</Button>
      <p>Campagne: {getCampaign.data?.name}</p>
      <p>Clients: {getClients.data?.map((client) => client.name).join(", ")}</p>
      <p>Mails: {getMails.data?.map((mail) => mail.id).join(", ")}</p>
      <p>
        Status du mail: {getMails.data?.map((mail) => mail.status).join(", ")}
      </p>
    </>
  );
};

export default TestCampaign;
