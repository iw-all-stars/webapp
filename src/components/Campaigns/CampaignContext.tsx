import React, {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useState,
} from "react";

export type Campaign = {
  id: string;
  name: string;
  creatorId: string;
  restaurantId: string;
  status: string;
  template: number;
  subject: string;
  body: string;
  url: string;
  fromName: string;
  fromEmail: string;
  createdAt: Date;
  updatedAt: Date;
};

interface CampaignContextProps {
  campaign: Partial<Campaign> | undefined;
  setCampaign: Dispatch<SetStateAction<Partial<Campaign> | undefined>>;
}

const CampaignContext = createContext<CampaignContextProps | undefined>(
  undefined
);

interface CampaignContextProviderProps {
  children: ReactNode;
  value: CampaignContextProps;
}

const CampaignContextProvider: React.FC<CampaignContextProviderProps> = ({
  children,
}) => {
  const [campaign, setCampaign] = useState<Partial<Campaign> | undefined>(
    undefined
  );

  const contextValue: CampaignContextProps = {
    campaign,
    setCampaign,
  };

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};

export { CampaignContext, CampaignContextProvider };
