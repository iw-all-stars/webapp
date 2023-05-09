/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Box } from "@chakra-ui/react";
import Image from "next/image";
import { type CreatePost } from "~/server/api/routers/story";
import {
    DragDropContext,
    type DragUpdate,
    Draggable,
    Droppable,
} from "react-beautiful-dnd";

interface DragFilesProps {
    files: File[];
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    posts: CreatePost[];
    setPosts: (posts: CreatePost[]) => void;
}

export const DragFiles = ({
    files,
    handleDrop,
    handleDragOver,
    posts,
    setPosts,
}: DragFilesProps) => {
    function reorder(list: CreatePost[], startIndex: number, endIndex: number) {
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

    return (
        <Box flex="flex" flexDirection="column">
            <Box
                width="300px"
                height="300px"
                background="red"
                onDrop={handleDrop}
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
                                {posts.map((item, index) => (
                                    <Draggable
                                        key={item.url}
                                        draggableId={item.url}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                {item.type === "image" ? (
                                                    <Image
                                                        width={50}
                                                        height={50}
                                                        src={item.url}
                                                        alt="Dan Abramov"
                                                    />
                                                ) : (
                                                    <video
                                                        muted={true}
                                                        autoPlay={true}
                                                        loop={true}
                                                        width={50}
                                                        height={50}
                                                    >
                                                        <source src={item.url} />
                                                    </video>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>
        </Box>
    );
};
