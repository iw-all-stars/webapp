import { Container } from "@chakra-ui/react";
import Head from "next/head";
import Navbar from "~/components/Navbar";


export default function LayoutBase({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>Base</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main style={{ height: "calc(100% - 97px)"}}>
        <Container maxW="6xl" h="full">
          {children}
        </Container>
      </main>
    </>
  )
}