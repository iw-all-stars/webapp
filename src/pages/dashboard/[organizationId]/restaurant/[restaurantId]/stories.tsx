import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Avatar,
	AvatarGroup,
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
	Skeleton,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { PostType, StoryStatus, type Post } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
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
import { PLATFORMS } from "./platforms";

const DashboardStory: NextPage = () => {
    const router = useRouter();

    const { data: stories, isLoading } = api.story.getAll.useQuery();

    const { data: platforms } = api.platform.getAllByRestaurantId.useQuery(
        router.query.restaurantId as string
    );

    const utils = api.useContext();
    // delete
    const deleteStoryMutation = api.story.delete.useMutation({
        onSuccess: () => {
            utils.story.getAll.invalidate();
        },
    });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isOpenAlert,
        onOpen: onOpenAlert,
        onClose: onCloseAlert,
    } = useDisclosure();
    const cancelRef = React.useRef<HTMLInputElement>(null);

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
                                            <MenuItem
                                                onClick={onOpenAlert}
                                                icon={<MdDelete />}
                                            >
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

                            <Box display="flex" height="180px" gap="1">
                                {(story.posts.slice(0, 3) || []).map(
                                    (post: Post, index) => (
                                        <Box
                                            flex="1"
                                            key={post.id}
                                            position="relative"
                                            height="100%"
                                        >
                                            {post.type === PostType.IMAGE ? (
                                                <Image
                                                    {...{
                                                        borderLeftRadius:
                                                            index === 0
                                                                ? "md"
                                                                : "",
                                                        borderRightRadius:
                                                            index ===
                                                            story.posts.slice(
                                                                0,
                                                                3
                                                            ).length -
                                                                1
                                                                ? "md"
                                                                : "",
                                                    }}
                                                    src={post.originalUrl}
                                                    alt="random image"
                                                    height="100%"
                                                    width="100%"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <video style={
													{
														'objectFit': 'cover',
														"height": '100%',
														"width": '100%',
														"borderRadius": "1px",
													}
												}>
                                                    <source
                                                        src={post.originalUrl}
                                                    />
                                                </video>
                                            )}

                                            {index === 2 &&
                                                story.posts.length > 3 && (
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
                                                        <Text
                                                            color="white"
                                                            fontSize="2xl"
                                                            fontWeight="bold"
                                                        >
                                                            +
                                                            {story.posts
                                                                .length - 3}
                                                        </Text>
                                                    </Box>
                                                )}
                                        </Box>
                                    )
                                )}
                            </Box>
                            <AlertDialog
                                isOpen={isOpenAlert}
                                leastDestructiveRef={cancelRef}
                                onClose={onCloseAlert}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader
                                            fontSize="lg"
                                            fontWeight="bold"
                                        >
                                            Delete Story
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                            Are you sure? You can't undo this
                                            action afterwards.
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <Button onClick={onCloseAlert}>
                                                Cancel
                                            </Button>
                                            <Button
                                                colorScheme="red"
                                                onClick={() => {
                                                    deleteStoryMutation.mutate({
                                                        id: story.id,
                                                    });
													onCloseAlert();
                                                }}
                                                ml={3}
                                            >
                                                Delete
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </Box>
                    ))
                }
            </Box>
        </Box>
    );
};

export default DashboardStory;
