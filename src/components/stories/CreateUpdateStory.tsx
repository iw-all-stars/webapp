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
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	useToast,
} from "@chakra-ui/react";
import { StoryStatus, type Post, type PostType } from "@prisma/client";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DragFiles } from "~/components/dragFiles.component";
import { type CreateStory } from "~/server/api/routers/story";
import { api } from "~/utils/api";

interface CreateStoryProps {
	isOpen: boolean;
	onClose: () => void;
}
	

const CreateUpdateStory = ({
	isOpen,
	onClose,
}: CreateStoryProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [hidePublishAt, setHidePublishAt] = useState<boolean>(false);

	const utils = api.useContext();

    const { mutate: addStoryMutation, error: addStoryError } = api.story.create.useMutation({
		onSuccess: () => {
			onClose();
			utils.story.getAll.invalidate();
		}
	});
    const createManyPost = api.post.createMany.useMutation({});
    const deleteStory = api.story.delete.useMutation({});

    const toast = useToast();

    function createStory(data: CreateStory) {
        addStoryMutation(data);
    }

    //async function deleteById(id: string) {
    //    deleteStory.mutate({ id });
    //}

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
                {
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
                            name
                        }))
                }
            )
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
            name
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
                    name
                }))
                createManyPost.mutate(newPosts, { onSuccess: (newPostsWithId) => {
                    setPosts((prevPosts) => {
                        return [
                            ...prevPosts,
                            ...newPostsWithId,
                        ];
                    });
                }
                
                });
                
            });
        }
    }, [files]);

    const handleDrop = async (files: File[]) => {
        for (const file of files) {
            if (file.type.split("/")[0] === "video") {
                const duration = await getVideoDuration(file);
                if (duration > 10) {
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
		<Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Story</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>

          </ModalBody>
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
                    error={addStoryError}
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
          <ModalFooter>
            <Button colorScheme='blue' mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
	);
};

export default CreateUpdateStory;
