import { StoryStatus } from "@prisma/client";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type EventPublishPost } from "~/server/services/storyScheduler.service";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    // check headers api-key
    if (req.headers["api-key"] !== process.env.API_KEY) {
        console.warn("Unauthorized call to /api/webhooks/publish")
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const body = req.body as { event: EventPublishPost, state: StoryStatus, details: string };
        await prisma.story.update({
            where: {
                id: body.event.storyId,
            },
            data: {
                status: body.state,
                publishedAt: body.state === StoryStatus.PUBLISHED ? new Date() : null,
            },
        });
        res.status(200).json({ message: "ok" });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
};
