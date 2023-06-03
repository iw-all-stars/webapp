import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { ChakraProvider } from "@chakra-ui/react";

import LayoutBase from "~/layouts/base";
import { api } from "~/utils/api";

import { theme } from "~/styles/globalTheme";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <LayoutBase>
          <Component {...pageProps} />
        </LayoutBase>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
