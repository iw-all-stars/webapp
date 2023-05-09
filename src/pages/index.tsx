/* eslint-disable @typescript-eslint/no-misused-promises */
import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type CreatePost, type CreateStory } from "~/server/api/routers/story";
import { api } from "~/utils/api";
import { DragFiles } from "./components/dragFiles.component";

const Home: NextPage = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [posts, setPosts] = useState<CreatePost[]>([]);

    const addStory = api.story.create.useMutation({});

    function createStory(data: CreateStory) {
        addStory.mutate(data);
    }

    const {
        handleSubmit,
        register,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateStory>();

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
            type: file.type.split('/')[0] as 'image' | 'video',
        }));
    };

    useEffect(() => {
        if (files.length > 0) {
            void uploadFiles().then((urls) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                setPosts(urls.map(({url, type}, i) => ({
                    url,
                    position: posts.length + i,
                    type,
                })));
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
    }, [posts])

    return (
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
            <FormControl isInvalid={!!errors.publishedAt}>
                <FormLabel htmlFor="name">published at</FormLabel>
                <Input
                    id="publishedAt"
                    placeholder="publishedAt"
                    type="date"
                    {...register("publishedAt", {
                        required: "This is required",
                    })}
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
                    console.log(posts);
                }}
            >
                log posts
            </Button>
        </form>
    );
};

export default Home;
