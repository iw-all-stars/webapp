import {
    CreateScheduleCommand,
    DeleteScheduleCommand,
    SchedulerClient,
} from "@aws-sdk/client-scheduler";
import { type Prisma, type Post, type Story } from "@prisma/client";
import { DateTime } from "luxon";
import { encrypt } from "~/utils/decrypte-password";

const client = new SchedulerClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_EVENT ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_EVENT ?? "",
    },
});

export const scheduleStory = async (
    story: Story & { posts: Post[] },
) => {
    try { 
        await deleteStorySchedule(story.id);
    } catch(e) {
        console.log(e)
    }

    const { minute, hour, day, month, year } = DateTime.fromJSDate(
        story.publishedAt
    )
        .toUTC()
        .toObject();
    // need to use UTC to make a cron expression
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const cron = `cron(${minute} ${hour} ${day} ${month} ? ${year})`;

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
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        password: encrypt("monnouvomdPé94290"),
                    },
                    platformKey: "instagram",
                    posts: story.posts,
                }),
            },
        })
    );
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
