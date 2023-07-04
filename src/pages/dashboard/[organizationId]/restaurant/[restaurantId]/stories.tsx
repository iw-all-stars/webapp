import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
	Avatar,
	AvatarGroup,
	Box,
	Button,
	Icon,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	Menu,
	MenuButton,
	MenuList,
	Skeleton,
	SkeletonCircle,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { type GetServerSideProps, type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiSearch } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { MdPhotoFilter } from "react-icons/md";
import { useDebounce } from "usehooks-ts";
import CreateUpdateStory from "~/components/stories/CreateUpdateStory";
import { NoResultsStories } from "~/components/stories/NoResultsStories";
import { StoryCard } from "~/components/stories/storyCard";
import { api } from "~/utils/api";
import { hasAccessToRestaurant } from "~/utils/hasAccessToRestaurantServerSideProps";
import { PLATFORMS } from "./platforms";

export const getServerSideProps: GetServerSideProps = async (context) => {
    return hasAccessToRestaurant(context);
};

const DashboardStory: NextPage = () => {
    const router = useRouter();

    const [search, setSearch] = useState<string>("");

    const debouncedSearchTerm = useDebounce(search, 500);
    const { register, watch, getValues, setValue } = useForm<{
        startDate: string | undefined;
        endDate: string | undefined;
    }>({});

    const [dateRanges, setDateRanges] = useState<{
        startDate: string | undefined;
        endDate: string | undefined;
    }>({
        startDate: undefined,
        endDate: undefined,
    });

    const { data: stories, isLoading } = api.story.getAll.useQuery({
        name: debouncedSearchTerm,
        dates: dateRanges,
    });
    const { data: platforms } = api.platform.getAllByRestaurantId.useQuery(
        router.query.restaurantId as string
    );

    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const subscription = watch(({ startDate, endDate }) => {
            if (startDate && endDate) {
                setDateRanges(getValues());
            }
            if (!startDate && !endDate) {
                setDateRanges(getValues());
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    if (!platforms?.length && !isLoading) {
        return (
            <Box
                h="full"
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
            >
                <Box
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                    gap="4"
                >
                    <AvatarGroup size="md">
                        {PLATFORMS.map((platform, i) => (
                            <Avatar
                                key={i}
                                name={platform}
                                src={`/${platform}.png`}
                            />
                        ))}
                    </AvatarGroup>
                    <Text fontSize="lg" fontWeight="bold">
                        You are not connected to any platform
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Connect to a platform to create a story
                    </Text>
                    <Button
                        rightIcon={<ArrowForwardIcon />}
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => {
                            router.push(
                                `/dashboard/${router.query.organizationId}/restaurant/${router.query.restaurantId}/platforms`
                            );
                        }}
                    >
                        Connect
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" h="full" w="full">
            <Box
                display="flex"
                gap="4"
                margin="12px 12px 6px 12px"
                alignItems="center"
            >
                <Text fontSize="lg" fontWeight="bold">
                    Stories
                </Text>
                <InputGroup flexShrink="3">
                    <Input
                        value={search}
                        onChange={(value) => setSearch(value.target.value)}
                        placeholder="Rechercher par nom de story ..."
                    />
                    <InputRightElement>
                        <Icon as={BiSearch} />
                    </InputRightElement>
                </InputGroup>
                <Menu>
                    <MenuButton as={IconButton} icon={<IoMdSettings />}>
                        Actions
                    </MenuButton>
                    <MenuList>
                        <Box
                            padding="4"
                            display="flex"
                            flexDirection="column"
                            gap="3"
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Text fontWeight="medium">Filtres</Text>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="solid"
                                    onClick={() => {
                                        setValue("startDate", undefined);
                                        setValue("endDate", undefined);
                                    }}
                                >
                                    Effacer
                                </Button>
                            </Box>
                            <Box>
                                <Text mb="1" fontSize="xs">
                                    Date de publication début
                                </Text>
                                <Input
                                    {...register("startDate")}
                                    placeholder="Select Date and Time"
                                    size="md"
                                    type="date"
                                />
                            </Box>
                            <Box>
                                <Text mb="1" fontSize="xs">
                                    Date de publication fin
                                </Text>
                                <Input
                                    {...register("endDate")}
                                    placeholder="Select Date and Time"
                                    size="md"
                                    type="date"
                                />
                            </Box>
                        </Box>
                    </MenuList>
                </Menu>
                <Button
                    leftIcon={<MdPhotoFilter />}
                    colorScheme="teal"
                    variant="solid"
                    onClick={onOpen}
                >
                    Créer une story
                </Button>
            </Box>

            {platforms?.length && !isLoading ? (
                <>
                    <CreateUpdateStory
                        connectedPlatforms={platforms}
                        isOpen={isOpen}
                        onClose={onClose}
                    />
                    {(stories || [])?.length > 0 ? (
                        <Box
                            display="flex"
                            overflowY="auto"
                            flexWrap="wrap"
                            gap="5"
                            margin="4"
                        >
                            {(stories || []).map((story) => (
                                <StoryCard
                                    connectedPlatforms={platforms}
                                    story={story}
                                    key={story.id}
                                />
                            ))}
                        </Box>
                    ) : (
                        <NoResultsStories />
                    )}
                </>
            ) : (
                <Box display="flex" gap={4}>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Box
                            key={i}
                            bg="gray.100"
                            height="283px"
                            width="294px"
                            marginTop="4"
                            borderRadius="md"
                            display="flex"
                            flexDirection="column"
                        >
                            <Box display="flex" alignItems="center" margin="5">
                                <SkeletonCircle
                                    startColor="gree.100"
                                    size="10"
                                />
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap="2"
                                    marginLeft="4"
                                >
                                    <Skeleton height="10px" width="150px" />
                                    <Skeleton height="10px" width="100px" />
                                </Box>
                            </Box>
                            <Box flex="1">
                                <Skeleton
                                    startColor="teal.50"
                                    endColor="teal.100"
                                    height="100%"
                                    width="100%"
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default DashboardStory;
