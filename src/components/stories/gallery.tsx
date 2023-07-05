import { PostType, type Post, type Story } from "@prisma/client";
import { Carousel } from "react-responsive-carousel";
import {
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";

interface StoriesGalleryProps {
    story: Story & { posts: Post[] };
    isOpen: boolean;
    onClose: () => void;
}

export const StoriesGallery = ({
    story,
    isOpen,
    onClose,
}: StoriesGalleryProps) => (
    <Modal
        size="xl"
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={() => {
            onClose();
        }}
    >
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>
                {story.name} - {story.posts.length} posts
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                {isOpen && (
                    <Carousel>
                        {story.posts.map((post) =>
                            post.type === PostType.IMAGE ? (
                                <Image
									aspectRatio="9/16"
									objectFit="cover"
                                    key={post.id}
                                    alt="a story media"
									height="500px"
									margin="auto"
                                    src={post.convertedUrl ?? ""}
                                />
                            ) : (
                                <video controls key={post.id} style={{
									aspectRatio: "9 / 16",
									objectFit: "cover",
									height: "500px",
									margin: "auto"
								}}>
                                    <source
                                        src={post.convertedUrl ?? ""}
                                        type="video/mp4"
                                    />
                                </video>
                            )
                        )}
                    </Carousel>
                )}
            </ModalBody>
        </ModalContent>
    </Modal>
);
