/* eslint-disable @typescript-eslint/no-misused-promises */
import {
	Box,
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Select,
	useToast
} from "@chakra-ui/react";
import {
	StoryStatus,
	type Post,
	type PostType,
	type Story,
	type Platform,
} from "@prisma/client";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DragFiles } from "~/components/dragFiles.component";
import { type CreateStory } from "~/server/api/routers/story";
import { api } from "~/utils/api";
import { dateFromBackend, toBackendDate } from "~/utils/date";

interface CreateStoryProps {
	connectedPlatforms: Omit<Platform, 'password'>[];
    story?: Story & { posts: Post[] };
    isOpen: boolean;
    onClose: () => void;
}

const CreateUpdateStory = ({ connectedPlatforms, story, isOpen, onClose }: CreateStoryProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [posts, setPosts] = useState<Post[]>(story?.posts ?? []);
    const [hidePublishAt, setHidePublishAt] = useState<boolean>(false);

    const utils = api.useContext();

    const {
        mutate: createUpdateStoryMutation,
        error: addStoryError,
        isLoading,
    } = api.story.upsert.useMutation({
        onSuccess: () => {
            if (!story?.id) {
                reset();
                setFiles([]);
                setPosts([]);
            }
            onClose();
            utils.story.getAll.invalidate();
        },
    });
    const createManyPost = api.post.createMany.useMutation({});

    const toast = useToast();

    function createUpdateStory(data: CreateStory) {
        createUpdateStoryMutation({
            id: story?.id,
            data: {
                ...data,
                publishedAt: toBackendDate(
                    data.publishedAt as string
                ).toISOString(),
            },
        });
    }

    const {
        handleSubmit,
        register,
        setValue,
        formState: { errors },
        watch,
        getValues,
        resetField,
        reset,
    } = useForm<CreateStory>({
        defaultValues: !story
            ? {
                  status: StoryStatus.SCHEDULED,
                  publishedAt: dateFromBackend(
                      DateTime.now().toISO() as string
                  ),
              }
            : {
                  name: story.name,
                  status: story.status as CreateStory["status"],
                  posts: story.posts,
				  platformId: story.platformId as string,
                  publishedAt: story.publishedAt
                      ? dateFromBackend(story.publishedAt as unknown as string)
                      : undefined,
              },
    });

    useEffect(() => {
        resetField("publishedAt");
        setHidePublishAt(
            getValues("status") === StoryStatus.DRAFT ||
                getValues("status") === StoryStatus.NOW
        );
    }, [watch("status")]);

    const uploadFiles = async () => {
        const urlsWithFiles = await Promise.all(
            files.map((file) => {
                const name = crypto.randomUUID();
                return fetch("/api/s3/uploadFile", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        type: file.type,
                    }),
                })
                    .then((res) => res.json())
                    .then(({ url }) => ({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        url: url as string,
                        file,
                        name,
                    }));
            })
        );

        const s3UrlsWithFiles = await Promise.all(
            urlsWithFiles.map(({ url, file, name }) =>
                fetch(url, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-type": file.type,
                        "Access-Control-Allow-Origin": "*",
                    },
                }).then(({ url }) => ({ url, file, name }))
            )
        );

        setFiles([]);

        return s3UrlsWithFiles.map(({ url, file, name }) => ({
            url: url.split("?")[0] ?? "never",
            type: file.type.split("/")[0]?.toUpperCase() as PostType,
            name,
        }));
    };

    useEffect(() => {
        if (files.length > 0) {
            void uploadFiles().then((urls) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                const newPosts = urls.map(({ url, type, name }, i) => ({
                    originalUrl: url,
                    position: posts.length + i,
                    type,
                    name,
                }));
                createManyPost.mutate(newPosts, {
                    onSuccess: (newPostsWithId) => {
                        setPosts((prevPosts) => {
                            return [...prevPosts, ...newPostsWithId];
                        });
                    },
                });
            });
        }
    }, [files]);

    const handleDrop = async (files: File[]) => {
        for (const file of files) {
            if (file.type.split("/")[0] === "video") {
                const duration = await getVideoDuration(file);
                if (duration > 60) {
                    toast({
                        title: "Video is too long",
                        description: "Video should be less than 10 seconds",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
            }
        }
        setFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    useEffect(() => {
        setValue("posts", posts);
    }, [posts]);

    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = "metadata";

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = reject;
            video.src = URL.createObjectURL(file);
        });
    };

    return (
        <Modal
            size="2xl"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {story?.id ? "Update" : "Create"} Story
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={handleSubmit(createUpdateStory)}>
                        <Box display="flex" flexDirection="column" gap="3">
                            <FormControl isInvalid={!!errors.name}>
                                <FormLabel htmlFor="name">
                                    Story name (optional)
                                </FormLabel>
                                <Input
                                    id="name"
                                    placeholder="name"
                                    {...register("name", {
                                        required: "This is required",
                                        minLength: {
                                            value: 4,
                                            message:
                                                "Minimum length should be 4",
                                        },
                                    })}
                                />
                                <FormErrorMessage>
                                    {errors.name && errors.name.message}
                                </FormErrorMessage>
                            </FormControl>

                            <FormControl>
                                <FormLabel htmlFor="status">
                                    Schedule type
                                </FormLabel>
                                <Select
                                    {...register("status", {
                                        required: "This is required",
                                    })}
                                >
                                    {[
                                        StoryStatus.NOW,
                                        StoryStatus.SCHEDULED,
                                        StoryStatus.DRAFT,
                                    ].map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel htmlFor="platformId">
                                    Platform
                                </FormLabel>
                                <Select
                                    {...register("platformId", {
                                        required: "This is required",
                                    })}
                                >
                                    {connectedPlatforms.map((platform, i) => (
                                        <option
                                            selected={
                                                i === 0
                                            }
                                            key={platform.key}
                                            value={platform.id}
                                        >
                                            {platform.key}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl
                                isInvalid={!!errors.publishedAt}
                                hidden={hidePublishAt}
                            >
                                <FormLabel htmlFor="publishedAt">
                                    Publication date
                                </FormLabel>
                                <Input
                                    id="publishedAt"
                                    placeholder="publishedAt"
                                    type="datetime-local"
                                    {...register("publishedAt", {})}
                                />
                                <FormErrorMessage>
                                    {errors.publishedAt &&
                                        errors.publishedAt.message}
                                </FormErrorMessage>
                            </FormControl>
                            <DragFiles
                                files={files}
                                handleDrop={handleDrop}
                                handleDragOver={handleDragOver}
                                posts={posts}
                                setPosts={setPosts}
                                error={addStoryError}
                            />
                            <Box mt="4" display="flex" justifyContent="end">
                                <Button
                                    colorScheme="teal"
                                    isLoading={isLoading}
                                    type="submit"
                                >
                                    Submit
                                </Button>
                                <Button
                                    onClick={() => {
                                        onClose();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateUpdateStory;
