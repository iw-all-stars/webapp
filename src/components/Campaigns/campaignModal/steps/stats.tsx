/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Box,
  Flex,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Icon,
  Text,
  Spinner,
} from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { CampaignContext } from "../../CampaignContext";
import { api } from "~/utils/api";
import { StarIcon } from "@chakra-ui/icons";

export const StatsStep = () => {
  const context = useContext(CampaignContext);
  const [mailData, setMailData] = React.useState<any[]>([]);

  const { data, isLoading } = api.mail.getMails.useQuery(context?.campaign?.id);

  useEffect(() => {
    if (data) {
      setMailData(
        data.filter(
          (mail) =>
            mail.status === "sent" && mail.campaignId === context?.campaign?.id
        )
      );
    }
  }, [data]);

  const renderStars = (key: string, activeStars: number) => {
    const stars = [];
    const votes =
      mailData.length > 0
        ? mailData.filter(
            (mail) => mail.rate == activeStars && mail.rate !== null
          ).length
        : 0;
    for (let i = 6; i > 0; i--) {
      if (i === 6) {
        stars.push(
          <Box>
            <Text
              key={i.toString() + "votes" + key}
              fontSize={24}
              fontWeight={500}
              pt={1}
              pr={2}
              w={"full"}
            >
              {votes}
            </Text>
            <Text
              key={i.toString() + "vote text" + key}
              fontSize={14}
              fontWeight={500}
              pr={2}
              color={"gray.500"}
              w={"full"}
            >
              {votes > 1 ? "votes" : "vote"}
            </Text>
          </Box>
        );
      } else {
        stars.push(
          <Icon
            key={i.toString() + "stars" + key}
            name="star"
            w={45}
            h={45}
            shadow={i <= activeStars ? "lg" : "none"}
            rounded={i <= activeStars ? "2xl" : "none"}
            padding={2}
            color={i <= activeStars ? "yellow.500" : "gray.300"}
          >
            <StarIcon />
          </Icon>
        );
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <Box w="full" h="md" justifyContent="center" alignContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box display="flex" w="full" p={8}>
      <Flex justifyContent="space-between" w="full">
        <StatGroup
          justifyContent="space-between"
          gap={4}
          w="80%"
          display="flex"
        >
          <Stat>
            <StatLabel>Mails envoyés</StatLabel>
            <StatNumber>{mailData.length}</StatNumber>
          </Stat>
          <Flex flexDirection="column" gap={12} align={"start"}>
            <Stat>
              <StatLabel>Taux d'ouverture</StatLabel>
              <StatNumber>
                {mailData.length > 0
                  ? (
                      (mailData.filter((mail) => mail.opened).length /
                        mailData.length) *
                      100
                    ).toFixed(2)
                  : 0}{" "}
                %
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Taux de désabonnement</StatLabel>
              <StatNumber>
                {mailData.length > 0
                  ? (
                      (mailData.filter((mail) => mail.unsub).length /
                        mailData.length) *
                      100
                    ).toFixed(2)
                  : 0}{" "}
                %
              </StatNumber>
            </Stat>
          </Flex>
        </StatGroup>
      </Flex>
      <Flex flexDirection="column" gap={2} align={"center"}>
        <Flex gap={2}>{renderStars("one", 5)}</Flex>
        <Flex gap={2}>{renderStars("two", 4)}</Flex>
        <Flex gap={2}>{renderStars("three", 3)}</Flex>
        <Flex gap={2}>{renderStars("four", 2)}</Flex>
        <Flex gap={2}>{renderStars("five", 1)}</Flex>
      </Flex>
    </Box>
  );
};

export default StatsStep;
