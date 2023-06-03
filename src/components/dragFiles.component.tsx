/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Box } from "@chakra-ui/react";
import { PostType, type Post } from "@prisma/client";
import Image from "next/image";
import { useRef } from "react";
import {
	DragDropContext,
	Draggable,
	Droppable,
	type DragUpdate,
} from "react-beautiful-dnd";

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
    error
}: DragFilesProps) => {

    const postes = posts

    const inputRef = useRef<HTMLInputElement>(null);

    const reorder = (list: Post[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        if (!removed) return result;
        result.splice(endIndex, 0, removed);

        return result;
    }

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
        if (!error) return false
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return !!error?.data?.zodError?.posts?.find((p: Post) => p.id === post.id)
    }

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
                onClick={() => inputRef.current?.click()}
                width="300px"
                height="300px"
                background="red"
                onDrop={(event: React.DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    const files = Array.from(event.dataTransfer.files);
                    handleDrop(files);
                }}
                onDragOver={handleDragOver}
            >
                <h1>Drag and drop here</h1>
            </Box>
            <Box display="flex" gap="4px">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <Box
                                display="flex"
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {postes.map((item, index) => (
                                    <Draggable
                                        key={item.originalUrl}
                                        draggableId={item.originalUrl}
                                        index={index}
                                        disableInteractiveElementBlocking={true}
                                    >
                                        {(provided, snapshot) => (
                                            <Box
                                                border={isStillConverting(item) ? "1px solid orange" : ""}
                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                {item.type === PostType.IMAGE ? (
                                                    <Image
                                                        width={50}
                                                        height={50}
                                                        src={item.originalUrl}
                                                        alt="Dan Abramov"
                                                    />
                                                ) : (
                                                    <Box>
                                                        <video
                                                            width={50}
                                                            height={50}
                                                        >
                                                            <source
                                                                src={item.originalUrl}
                                                            />
                                                        </video>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>
            {
                !!error?.data?.zodError?.posts && (
                    <p>Wait few seconds until all files are converted</p>
                )
            }
        </Box>
    );
};