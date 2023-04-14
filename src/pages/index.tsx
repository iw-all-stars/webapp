import { type NextPage } from "next";
import Head from "next/head";
import { Button, Container } from "@chakra-ui/react";
import { api } from "~/utils/api";

const Home: NextPage = () => {

  const addExample = api.example.add.useMutation({});

  const handleExample = () => {
    addExample.mutate();
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container>
          <Button onClick={() => handleExample()}>
            Add Example
          </Button>
        </Container>
      </main>
    </>
  );
};

export default Home;