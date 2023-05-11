/* eslint-disable @typescript-eslint/no-misused-promises */
import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Select,
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type CreatePost, type CreateStory } from "~/server/api/routers/story";
import { api } from "~/utils/api";
import { StoryStatus } from "@prisma/client";
import { DragFiles } from "~/components/dragFiles.component";

const DashboardStory: NextPage = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [posts, setPosts] = useState<CreatePost[]>([]);
    const [hidePublishAt, setHidePublishAt] = useState<boolean>(false);

    const addStory = api.story.create.useMutation({});
    const deleteStory = api.story.delete.useMutation({});

    function createStory(data: CreateStory) {
        addStory.mutate(data);
    }

    function deleteById(id: string) {
        deleteStory.mutate({ id });
    }

    const {
        handleSubmit,
        register,
        setValue,
        formState: { errors, isSubmitting },
        watch,
        getValues,
        resetField,
    } = useForm<CreateStory>();

    useEffect(() => {
        resetField("publishedAt");
        setHidePublishAt(getValues("status") === StoryStatus.DRAFT);
    }, [watch("status")]);

    const uploadFiles = async () => {
        const urlsWithFiles = await Promise.all(
            files.map((file) =>
                fetch("/api/s3/uploadFile", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({
                        name: crypto.randomUUID(),
                        type: file.type,
                    }),
                })
                    .then((res) => res.json())
                    .then(({ url }) => ({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        url: url as string,
                        file,
                    }))
            )
        );

        const s3UrlsWithFiles = await Promise.all(
            urlsWithFiles.map(({ url, file }) =>
                fetch(url, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-type": file.type,
                        "Access-Control-Allow-Origin": "*",
                    },
                }).then(({ url }) => ({ url, file }))
            )
        );

        setFiles([]);

        return s3UrlsWithFiles.map(({ url, file }) => ({
            url: url.split("?")[0] ?? "never",
            type: file.type.split("/")[0] as "image" | "video",
        }));
    };

    useEffect(() => {
        if (files.length > 0) {
            void uploadFiles().then((urls) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                setPosts((prevPosts) => {
                    return [
                        ...prevPosts,
                        ...urls.map(({ url, type }, i) => ({
                            url,
                            position: posts.length + i,
                            type,
                        })),
                    ];
                });
            });
        }
    }, [files]);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const newFiles = Array.from(event.dataTransfer.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    useEffect(() => {
        setValue("posts", posts);
    }, [posts]);

    return (
        <Box>
            <form onSubmit={handleSubmit(createStory)}>
                <FormControl isInvalid={!!errors.name}>
                    <FormLabel htmlFor="name">story name</FormLabel>
                    <Input
                        id="name"
                        placeholder="name"
                        {...register("name", {
                            required: "This is required",
                            minLength: {
                                value: 4,
                                message: "Minimum length should be 4",
                            },
                        })}
                    />
                    <FormErrorMessage>
                        {errors.name && errors.name.message}
                    </FormErrorMessage>
                </FormControl>

                <FormControl>
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
                                selected={status === StoryStatus.NOW}
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl
                    isInvalid={!!errors.publishedAt}
                    hidden={hidePublishAt}
                >
                    <FormLabel htmlFor="name">published at</FormLabel>
                    <Input
                        id="publishedAt"
                        placeholder="publishedAt"
                        type="datetime-local"
                        {...register("publishedAt", {})}
                    />
                    <FormErrorMessage>
                        {errors.publishedAt && errors.publishedAt.message}
                    </FormErrorMessage>
                </FormControl>
                <DragFiles
                    files={files}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    posts={posts}
                    setPosts={setPosts}
                />
                <Button
                    mt={4}
                    colorScheme="teal"
                    isLoading={isSubmitting}
                    type="submit"
                >
                    Submit
                </Button>
                <Button
                    onClick={() => {
                        console.log(getValues());
                    }}
                >
                    log posts
                </Button>
            </form>
            <Button
                onClick={() => {
                    deleteById("clhix5jr7000o7toyd573f6ux");
                }}
            >
                Delete
            </Button>
        </Box>
    );
};

export default DashboardStory;
