import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { ChakraProvider } from "@chakra-ui/react";

import { CampaignContextProvider } from "~/components/Campaigns/CampaignContext";
import LayoutBase from "~/layouts/base";
import { api } from "~/utils/api";

import { theme } from "~/styles/globalTheme";
import "~/styles/globals.css";
import { useState } from "react";
import { type Campaign } from "@prisma/client";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [campaign, setCampaign] = useState<Partial<Campaign> | undefined>(
    undefined
  );

  console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  console.log(process.env.NEXT_PUBLIC_MAIL_TEMPLATE_CAMPAIGN_ID)

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <LayoutBase>
          <CampaignContextProvider
            value={{
              campaign,
              setCampaign,
            }}
          >
            <Component {...pageProps} />
          </CampaignContextProvider>
        </LayoutBase>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
