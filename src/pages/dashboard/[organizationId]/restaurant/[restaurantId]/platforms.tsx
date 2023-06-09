import { Box, Heading, Text } from "@chakra-ui/react";
import { PlatformKey, type Platform } from "@prisma/client";
import { type MutateOptions } from "@tanstack/react-query";
import { type GetServerSideProps, type NextPage } from "next";
import { useRouter } from "next/router";
import { PlatformCard } from "~/components/platforms/platformCard";
import { api } from "~/utils/api";
import { hasAccessToRestaurant } from "~/utils/hasAccessToRestaurantServerSideProps";

export const PLATFORMS = [
    PlatformKey.INSTAGRAM,
    PlatformKey.FACEBOOK,
    PlatformKey.TIKTOK,
    PlatformKey.TWITTER,
];

export type createUpdatePlatformParams = {
    dataForm: Pick<Platform, "login" | "password">;
    key: PlatformKey;
    platform?: Omit<Platform, 'password'>;
    options?: MutateOptions;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    return hasAccessToRestaurant(context);
};

const DashboardPlatforms: NextPage = () => {
    const router = useRouter();

    const utils = api.useContext();

    const { data: platforms, isLoading } =
        api.platform.getAllByRestaurantId.useQuery(
            router.query.restaurantId as string, {
				refetchOnWindowFocus: false,
			}
        );

    const createPlatformMutation = api.platform.create.useMutation({
        onSuccess: () => {
            utils.platform.getAllByRestaurantId.invalidate();
        },
    });

    const updatePlatformMutation = api.platform.updateById.useMutation({
        onSuccess: () => {
            utils.platform.getAllByRestaurantId.invalidate();
        },
    });

    const createUpdatePlatform = ({
        dataForm,
        key,
        platform,
        options,
    }: createUpdatePlatformParams) => {
        if (platform?.id) {
            updatePlatformMutation.mutate(
                { id: platform.id, ...dataForm },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                options as any
            );
        } else {
            createPlatformMutation.mutate(
                {
                    ...dataForm,
                    restaurantId: router.query.restaurantId as string,
                    key,
                },
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                options as any
            );
        }
    };


    return (
        <Box h="full" w="full" pt={8}>
            <Box display="flex">
                <Heading
                    display={"flex"}
                    flexDirection={"row"}
                    gap={1}
                    fontSize={18}
                    fontWeight={400}
                >
                    <b>Plateformes</b>
                    <Text letterSpacing={"widest"} fontStyle={"italic"}>
                        ({platforms?.length}/{PLATFORMS.length})
                    </Text>
                </Heading>
            </Box>
            <Box
                display="flex"
                overflowY="auto"
                flexWrap="wrap"
                gap="5"
                marginTop="4"
            >
                {PLATFORMS.map((platformKey, i) => (
                    <PlatformCard
                        isLoading={isLoading}
                        platformKey={platformKey}
                        platform={platforms?.find(
                            (platform) => platform.key === platformKey
                        )}
                        available={platformKey === PlatformKey.INSTAGRAM}
                        createUpdatePlatform={createUpdatePlatform}
                        isLoadingCreateUpdatePlatform={
                            createPlatformMutation.isLoading || updatePlatformMutation.isLoading
                        }
                        key={i}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default DashboardPlatforms;
