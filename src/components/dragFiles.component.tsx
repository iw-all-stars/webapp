/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Box, Icon, Image, Text } from "@chakra-ui/react";
import { PostType, type Post } from "@prisma/client";
import { useRef } from "react";
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DragUpdate,
} from "react-beautiful-dnd";
import { BiImageAdd } from "react-icons/bi";

interface DragFilesProps {
    files: File[];
    handleDrop: (files: File[]) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    posts: Post[];
    setPosts: (posts: Post[]) => void;
    error: any;
}

export const DragFiles = ({
    files,
    handleDrop,
    handleDragOver,
    posts,
    setPosts,
    error,
}: DragFilesProps) => {
    const postes = posts;

    const inputRef = useRef<HTMLInputElement>(null);

    const reorder = (list: Post[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        if (!removed) return result;
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = (result: DragUpdate) => {
        if (!result.destination) {
            return;
        }

        const items = reorder(
            posts,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            result.source.index,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            result.destination.index
        );

        setPosts(items.map((item, index) => ({ ...item, position: index })));
    };

    const isStillConverting = (post: Post): boolean => {
        if (!error) return false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return !!error?.data?.zodError?.posts?.find(
            (p: Post) => p.id === post.id
        );
    };

    return (
        <Box flex="flex" flexDirection="column">
            <input
                ref={inputRef}
                id="file-upload"
                hidden
                type="file"
                onChange={(event) => {
                    const files = Array.from(event.target.files!);
                    handleDrop(files);
                    event.target.value = "";
                }}
                multiple
                accept="image/png, image/jpeg, image/jpg, video/*"
            />
            <Box
                hidden={posts.length > 0}
                onClick={() => inputRef.current?.click()}
                width="100%"
                height="150px"
                background="purple.100"
                border={"1px dashed #000"}
                borderRadius="3"
                onDrop={(event: React.DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    const files = Array.from(event.dataTransfer.files);
                    handleDrop(files);
                }}
                onDragOver={handleDragOver}
            >
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="full"
                >
                    <Box>
                        <Box
                            textAlign="center"
                            fontSize="xl"
                            color="purple.800"
                            fontWeight="bold"
                        >
                            Drag and drop your files here
                        </Box>
                        <Box
                            textAlign="center"
                            color="purple.400"
                            fontSize="sm"
                        >
                            or
                        </Box>
                        <Box
                            textAlign="center"
                            color="purple.400"
                            fontSize="sm"
                        >
                            Click to select files
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box display="flex" gap="2">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div style={{ display: "flex", overflow: "auto" }}>
                        <Droppable
                            droppableId="droppable"
                            direction="horizontal"
                        >
                            {(provided, snapshot) => (
                                <div
                                    style={{ display: "flex" }}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {postes.map((item, index) => (
                                        <Draggable
                                            key={item.originalUrl}
                                            draggableId={item.originalUrl}
                                            index={index}
                                            disableInteractiveElementBlocking={
                                                true
                                            }
                                        >
                                            {(provided, snapshot) => (
                                                <Box
                                                    width="120px"
                                                    height={200}
                                                    mr={1}
                                                    border={
                                                        isStillConverting(item)
                                                            ? "1px solid orange"
                                                            : ""
                                                    }
                                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {item.type ===
                                                    PostType.IMAGE ? (
                                                        <Image
                                                            height={200}
                                                            objectFit="cover"
                                                            src={
                                                                item.originalUrl
                                                            }
                                                            alt=""
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
                                                            <source
                                                                src={
                                                                    item.originalUrl
                                                                }
                                                            />
                                                        </video>
                                                    )}
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </DragDropContext>
                <Box
                    hidden={!posts.length}
                    minWidth={120}
                    cursor="pointer"
                    backgroundColor="purple.100"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    onClick={() => inputRef.current?.click()}
                >
                    <Icon
                        w={10}
                        h={10}
                        color="purple.400"
                        as={BiImageAdd}
                    ></Icon>
                    <Text fontSize="xs" color="purple.400">
                        Add files
                    </Text>
                </Box>
            </Box>
            {!!error?.data?.zodError?.posts && (
                <p>Wait few seconds until all files are converted</p>
            )}
        </Box>
    );
};
