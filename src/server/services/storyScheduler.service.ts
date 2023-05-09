import {
    CreateScheduleCommand,
    SchedulerClient,
} from "@aws-sdk/client-scheduler";
import { type Post, type Story } from "@prisma/client";
import { DateTime } from "luxon";

const client = new SchedulerClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_EVENT ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_EVENT ?? "",
    },
});

export const scheduleStory = async (story: Story & { posts: Post[] }) => {
    const { minute, hour, day, month, year } = DateTime.fromJSDate(
        story.publishedAt
    )
        .toUTC()
        .toObject();
    // need to use UTC to make a cron expression
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const cron = `cron(${minute} ${hour} ${day} ${month} ? ${year})`;

    story.posts.sort((a, b) => a.position - b.position);
    const posts = story.posts.map((post) => ({
        url: post.url,
        type: post.type,
    }));

    await client.send(
        new CreateScheduleCommand({
            Name: story.id,
            ScheduleExpression: cron,
            FlexibleTimeWindow: {
                Mode: "OFF",
            },
            State: "ENABLED",
            Target: {
                Arn: process.env.ARN_LAMBDA_FUNCTION_PUBLISH_POST ?? "",
                RoleArn: process.env.ROLE_ARN_EVENT_BRIDGE_SCHEDULER ?? "",
                Input: JSON.stringify({
                    credentials: {
                        username: "devftn5",
                        password: "monnouvomdPé94290",
                    },
                    platformKey: "instagram",
                    posts
                }),
            },
        })
    );
};
