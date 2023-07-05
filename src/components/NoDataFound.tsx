import { Flex, Image, Text } from "@chakra-ui/react";

export type NoDataFoundProps = {
  text: string;
  button?: React.ReactNode;
};

export function NoDataFound({ 
  text,
  button
}: NoDataFoundProps) {
  return (
    <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
    >
        <Image
            src="/assets/Error1.svg"
            width={100}
            height={100}
            alt=""
        />
        <Text fontWeight="semibold">
            {text}
        </Text>
        {button}
    </Flex>
  )
}