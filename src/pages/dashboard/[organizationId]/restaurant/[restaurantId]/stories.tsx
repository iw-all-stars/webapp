import {
    Avatar,
    Box,
    Button,
    Icon,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { type Post, StoryStatus } from "@prisma/client";
import { on } from "events";
import { type NextPage } from "next";
import { BiSearch, BiTime } from "react-icons/bi";
import {
    BsFileText,
    BsFillCheckCircleFill,
    BsFillEyeFill,
    BsPhone,
    BsThreeDotsVertical,
} from "react-icons/bs";
import { GoSettings } from "react-icons/go";
import { MdDelete, MdOutlineModeEditOutline } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import CreateUpdateStory from "~/components/stories/CreateUpdateStory";
import { api } from "~/utils/api";

const DashboardStory: NextPage = () => {
    const { data: stories, isLoading } = api.story.getAll.useQuery();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const renderStatus = (status: StoryStatus) => {
        switch (status) {
            case StoryStatus.DRAFT:
                return (
                    <>
                        <Text
                            marginRight="6px"
                            fontSize="sm"
                            color="gray.500"
                            ml="2"
                        >
                            Draft
                        </Text>
                        <Icon as={BsFileText} color="gray.400" />
                    </>
                );
            case StoryStatus.PUBLISHED:
                return (
                    <>
                        <Text
                            marginRight="6px"
                            fontSize="sm"
                            color="gray.500"
                            ml="2"
                        >
                            Published
                        </Text>
                        <Icon as={BsFillCheckCircleFill} color="green.400" />
                    </>
                );
            case StoryStatus.SCHEDULED:
                return (
                    <>
                        <Text
                            marginRight="6px"
                            fontSize="sm"
                            color="gray.500"
                            ml="2"
                        >
                            Scheduled
                        </Text>
                        <Icon boxSize="5" as={BiTime} color="orange.400" />
                    </>
                );
            case StoryStatus.ERROR:
                return (
                    <>
                        <Text
                            marginRight="6px"
                            fontSize="sm"
                            color="gray.500"
                            ml="2"
                        >
                            Error
                        </Text>
                        <Icon boxSize="5" as={TiDelete} color="red.400" />
                    </>
                );
            default:
                <></>;
        }
    };

    if (isLoading) {
        return <div>Chargement en cours...</div>;
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

            {/* Modal */}
            <CreateUpdateStory isOpen={isOpen} onClose={onClose} />

            <Box
                display="flex"
                overflowY="auto"
                flexWrap="wrap"
                gap="5"
                margin="4"
            >
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    (stories || []).map((story, index) => (
                        <Box
                            width={{ base: "100%", sm: "100%" }}
                            flex={{ lg: "1 0 21%" }}
                            maxWidth={{ md: "unset", lg: "294px" }}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="#F2F2FF"
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            key={story.id}
                        >
                            <Box
                                display="flex"
                                flexDirection="column"
                                padding="4"
                            >
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Box display="flex" gap="2">
                                        <Avatar
                                            size="sm"
                                            name="Dan Abrahmov"
                                            src="/instagram.png"
                                        />
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight="bold"
                                            >
                                                {story.name ?? "Untitled"}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                            >
                                                {story.publishedAt &&
                                                    new Date(
                                                        story.publishedAt
                                                    ).toLocaleDateString()}
                                            </Text>
                                        </Box>
                                    </Box>

                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<BsThreeDotsVertical />}
                                            variant="ghost"
                                        />
                                        <MenuList>
                                            <MenuItem
                                                icon={
                                                    <MdOutlineModeEditOutline />
                                                }
                                            >
                                                Edit
                                            </MenuItem>
                                            <MenuItem icon={<BsFillEyeFill />}>
                                                View
                                            </MenuItem>
                                            <MenuItem icon={<MdDelete />}>
                                                Delete
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Box>

                                <Box
                                    margin="4px 0"
                                    display="flex"
                                    alignItems="center"
                                >
                                    <Text fontSize="sm" fontWeight="bold">
                                        Status :
                                    </Text>
                                    {renderStatus(story.status)}
                                </Box>
                            </Box>

                            <Box display="flex" height="180px" gap="1" >
                                {(story.posts.slice(0, 3) || []).map((post: Post, index) => (
                                    <Box flex="1" key={post.id} position="relative" height="100%">
                                        <Image
                                            {
												...{
													borderLeftRadius: index === 0 ? "md" : "",
													borderRightRadius: index === story.posts.slice(0, 3).length - 1 ? "md" : "",
												}
											}
                                            src={post.originalUrl}
                                            alt="random image"
                                            height="100%"
											width="100%"
                                            objectFit="cover"
                                        />
										{ index === 2 && story.posts.length > 3 && (
											<Box
												position="absolute"
												top="0"
												left="0"
												height="100%"
												width="100%"
												background="rgba(0,0,0,0.35)"
												borderRadius="md"
												display="flex"
												justifyContent="center"
												alignItems="center"
											>
												<Text color="white" fontSize="2xl" fontWeight="bold">	
													+{story.posts.length - 3}
												</Text>
												</Box>
										)}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))
                }
            </Box>
        </Box>
    );
};

export default DashboardStory;
