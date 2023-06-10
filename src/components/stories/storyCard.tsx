import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Avatar,
    Box,
    Button,
    Icon,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { PostType, StoryStatus, type Post, type Story } from "@prisma/client";
import { useRef } from "react";
import { BiTime } from "react-icons/bi";
import {
    BsFileText,
    BsFillCheckCircleFill,
    BsFillEyeFill,
    BsHourglassSplit,
    BsThreeDotsVertical,
} from "react-icons/bs";
import { MdDelete, MdOutlineModeEditOutline } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { api } from "~/utils/api";
import CreateUpdateStory from "./CreateUpdateStory";

interface StoryCardProps {
    story: Story & { posts: Post[] };
}

export const StoryCard = ({ story }: StoryCardProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const utils = api.useContext();
    // delete
    const deleteStoryMutation = api.story.delete.useMutation({
        onSuccess: () => {
            utils.story.getAll.invalidate();
        },
    });

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
            case StoryStatus.NOW:
                return (
                    <>
                        <Text
                            marginRight="6px"
                            fontSize="sm"
                            color="gray.500"
                            ml="2"
                        >
                            Now
                        </Text>
                        <Icon boxSize="5" as={BsHourglassSplit} color="blue.400" />
                    </>
                );
            default:
                <></>;
        }
    };

    const {
        isOpen: isOpenAlert,
        onOpen: onOpenAlert,
        onClose: onCloseAlert,
    } = useDisclosure();
    const cancelRef = useRef<HTMLInputElement>(null);

    return (
        <>
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
                <Box display="flex" flexDirection="column" padding="4">
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
                            <Box display="flex" flexDirection="column">
                                <Text fontSize="sm" fontWeight="bold">
                                    {story.name ?? "Untitled"}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
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
                                    onClick={onOpen}
                                    icon={<MdOutlineModeEditOutline />}
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

                    <Box margin="4px 0" display="flex" alignItems="center">
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
                                                index === 0 ? "md" : "",
                                            borderRightRadius:
                                                index ===
                                                story.posts.slice(0, 3).length -
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
                                    <video
                                        style={{
                                            objectFit: "cover",
                                            height: "100%",
                                            width: "100%",
                                            borderRadius: "1px",
                                        }}
                                    >
                                        <source src={post.originalUrl} />
                                    </video>
                                )}

                                {index === 2 && story.posts.length > 3 && (
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
                                            +{story.posts.length - 3}
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
                    <AlertDialogOverlay bg="blackAlpha.300">
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Delete Story
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                Are you sure? You can't undo this action
                                afterwards.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button onClick={onCloseAlert}>Cancel</Button>
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

            <CreateUpdateStory
                isOpen={isOpen}
                onClose={onClose}
                story={story}
            ></CreateUpdateStory>
        </>
    );
};
