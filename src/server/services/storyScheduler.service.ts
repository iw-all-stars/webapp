import {
	CreateScheduleCommand,
	DeleteScheduleCommand,
	SchedulerClient,
} from "@aws-sdk/client-scheduler";
import {
	PlatformKey,
	type Organization,
	type Platform,
	type Post,
	type Restaurant,
	type Story,
} from "@prisma/client";
import { DateTime } from "luxon";

const client = new SchedulerClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_EVENT ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_EVENT ?? "",
    },
});

export const scheduleStory = async (
    story: Story & { posts: Post[]; platform: Platform },
    restaurantWithOrga: Restaurant & {
        organization: Organization;
    }
) => {
    if (!story.publishedAt) return;

    const { minute, hour, day, month, year } = DateTime.fromJSDate(
        story.publishedAt
    )
        .toUTC()
        .toObject();
    // need to use UTC to make a cron expression
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const cron = `cron(${minute} ${hour} ${day} ${month} ? ${year})`;

    await _sendSchedule(
        client,
        {
            ...story,
            callbackUrl:
                "https://fdfd-94-228-190-38.ngrok-free.app/api/webhooks/publish",
            credentials: {
                username: story.platform.login,
                password: story.platform.password,
            },
            storyId: story.id,
            restaurantId: restaurantWithOrga.id,
            organizationId: restaurantWithOrga.organization.id,
            platformKey: PlatformKey.INSTAGRAM,
        },
        cron
    );
};

export const deleteStorySchedule = async (storyId: string): Promise<boolean> => {
    return client
        .send(
            new DeleteScheduleCommand({
                Name: storyId,
            })
        )
		.then(() => {
			console.log("[CRON deleted] : ", storyId);
			return true;
		})
        .catch((err: Error) => {
            console.error("[CRON doesnt exist] : ", err);
            return false;
        });
};

type Credentials = {
    username: string;
    password: string;
};

export type EventPublishPost = {
    storyId: string;
    restaurantId: string;
    organizationId: string;
    credentials: Credentials;
    platformKey: PlatformKey;
    posts: Post[];
    callbackUrl: string;
};

const _sendSchedule = (
    client: SchedulerClient,
    event: EventPublishPost,
    cron: string
) => {
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
};
