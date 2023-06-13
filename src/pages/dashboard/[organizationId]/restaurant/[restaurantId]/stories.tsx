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
	Text,
	useDisclosure
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { BiSearch } from "react-icons/bi";
import {
	BsPhone
} from "react-icons/bs";
import { GoSettings } from "react-icons/go";
import CreateUpdateStory from "~/components/stories/CreateUpdateStory";
import { StoryCard } from "~/components/stories/storyCard";
import { api } from "~/utils/api";
import { PLATFORMS } from "./platforms";

const DashboardStory: NextPage = () => {
    const router = useRouter();

    const { data: stories, isLoading } = api.story.getAll.useQuery();
    const { data: platforms } = api.platform.getAllByRestaurantId.useQuery(
        router.query.restaurantId as string
    );

    const { isOpen, onOpen, onClose } = useDisclosure();

    if (!platforms?.length) {
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
            <Skeleton isLoaded={!isLoading}>
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
                        <Input placeholder="Search by story name ..." />
                        <InputRightElement>
                            <Icon as={BiSearch} />
                        </InputRightElement>
                    </InputGroup>
                    <Menu>
                        <MenuButton as={IconButton} icon={<GoSettings />}>
                            Actions
                        </MenuButton>
                        <MenuList>
                            <Box>Dates</Box>
                        </MenuList>
                    </Menu>
                    <Button
                        leftIcon={<BsPhone />}
                        colorScheme="teal"
                        variant="solid"
                        onClick={onOpen}
                    >
                        Create Story
                    </Button>
                </Box>
            </Skeleton>

            {/* Modal */}
            <CreateUpdateStory connectedPlatforms={platforms} isOpen={isOpen} onClose={onClose} />

            <Box
                display="flex"
                overflowY="auto"
                flexWrap="wrap"
                gap="5"
                margin="4"
            >
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    (stories || []).map((story) => (
                        <StoryCard connectedPlatforms={platforms} story={story} key={story.id} />
                    ))
                }
            </Box>
        </Box>
    );
};

export default DashboardStory;
