import {
    CreateScheduleCommand,
    DeleteScheduleCommand,
    SchedulerClient
} from "@aws-sdk/client-scheduler";
import { type Post, type Story } from "@prisma/client";
import { DateTime } from "luxon";
import { encrypt } from "~/utils/decrypte-password";

const client = new SchedulerClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_EVENT ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_EVENT ?? "",
    },
});

export const scheduleStory = async (story: Story & { posts: Post[] }) => {
    console.info('🟩 SCHEDULE STORY ', story.id)
    try {
        await deleteStorySchedule(story.id);
    } catch (e) {
        console.log(e);
    }

    if (!story.publishedAt) return;

    const { minute, hour, day, month, year, second } = DateTime.fromJSDate(
        story.publishedAt
    )
        .toUTC()
        .toObject();
    // need to use UTC to make a cron expression
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const cron = `cron(${minute} ${hour} ${day} ${month} ? ${year})`;

    await _sendSchedule(client, {
        ...story,
        callbackUrl: 'https://fdfd-94-228-190-38.ngrok-free.app/api/webhooks/publish',
        credentials: {
            username: "devftn5",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            password: encrypt("monnouvomdPé94290"),
        },
        storyId: story.id,
        restaurantId: 'story.restaurantId',
        organizationId: 'story.organizationId',
        platformKey: PlatformKeys.INSTAGRAM,
    }, cron);
};

export const deleteStorySchedule = async (storyId: string) => {
    return client
        .send(
            new DeleteScheduleCommand({
                Name: storyId,
            })
        )
        .catch((err: Error) => {
            console.error("[CRON doesnt exist] : ", err);
            return err;
        });
};

type Credentials = {
    username: string;
    password: string;
};

enum PlatformKeys {
    INSTAGRAM = "instagram",
    FACEBOOK = "facebook", // not implemented
    TIKTOK = "tiktok", // not implemented
}

export type EventPublishPost = {
    storyId: string;
    restaurantId: string;
    organizationId: string;
    credentials: Credentials;
    platformKey: PlatformKeys;
    posts: Post[];
    callbackUrl: string;
};

const _sendSchedule = (client: SchedulerClient, event: EventPublishPost, cron : string) => {
    return client.send(
        new CreateScheduleCommand({
            Name: event.storyId,
            ScheduleExpression: cron,
            FlexibleTimeWindow: {
                Mode: "OFF",
            },
            State: "ENABLED",
            Target: {
                Arn: process.env.ARN_LAMBDA_FUNCTION_PUBLISH_POST ?? "",
                RoleArn: process.env.ROLE_ARN_EVENT_BRIDGE_SCHEDULER ?? "",
                Input: JSON.stringify(event),
            },
        })
    );
}