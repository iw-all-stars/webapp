import { expect } from "@jest/globals";
import {
  type Restaurant,
  type Platform,
  type Post,
  type Story,
  type Organization,
} from "@prisma/client";
import { IgApiClient } from "instagram-private-api";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as storyScheduler from "../services/storyScheduler.service";
import { StoryStatusHandler } from "../services/storyStatusHandler.service";
import { prismaMock } from "../singleton";

jest.mock("../services/storyScheduler.service");
jest.mock("instagram-private-api", () => ({
  IgApiClient: jest.fn().mockImplementation(() => ({
    state: {
      generateDevice: jest.fn(),
    },
    account: {
      login: jest.fn(),
    },
    media: {
      delete: jest.fn(),
    },
  })),
}));
describe("StoryStatusHandler", () => {
  describe("_handleCreateOrUpdate", () => {
    it("should call deleteStorySchedule every time when update a story", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "update");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        status: "DRAFT",
        platformId: "1",
        name: "story1",
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);

      await storyStatusHandler.handle();

      // deleteStorySchedule expect to have called
      expect(storyScheduler.deleteStorySchedule).toHaveBeenCalledTimes(1);
    });

    it("should call deleteStorySchedule every time when create a story", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "create");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        status: "DRAFT",
        platformId: "1",
        name: "story1",
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);

      await storyStatusHandler.handle();

      // deleteStorySchedule expect to have called
      expect(storyScheduler.deleteStorySchedule).toHaveBeenCalledTimes(1);
    });

    it("should call scheduleStory if status is SCHEDULED", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "create");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        status: "SCHEDULED",
        platformId: "1",
        name: "story1",
      };

      const platform: Platform & { restaurant: Restaurant } = {
        id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        key: "INSTAGRAM",
        login: "login",
        password: "password",
        restaurantId: "1",
        restaurant: {
          address: "address",

          createdAt: new Date(),
          id: "1",
          latitude: 1,
          longitude: 1,
          name: "name",
          categoryId: "1",
          updatedAt: new Date(),
          organizationId: "1",
          logo: "logoUrl",
        },
      };

      const restaurant: Restaurant & { organization: Organization } = {
        address: "address",
        createdAt: new Date(),
        id: "1",
        latitude: 1,
        longitude: 1,
        name: "name",
        categoryId: "1",
        updatedAt: new Date(),
        organizationId: "1",
        logo: "logoUrl",
        organization: {
          id: "1",
          createdAt: new Date(),
          description: "description",
          name: "name",
          updatedAt: new Date(),
        },
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);
      prismaMock.platform.findFirst.mockResolvedValueOnce(platform);
      prismaMock.restaurant.findFirst.mockResolvedValueOnce(restaurant);

      await storyStatusHandler.handle();

      expect(storyScheduler.scheduleStory).toHaveBeenCalledTimes(1);
    });

    it("should call scheduleStory if status is NOW", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "create");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        status: "NOW",
        platformId: "1",
        name: "story1",
      };

      const platform: Platform & { restaurant: Restaurant } = {
        id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        key: "INSTAGRAM",
        login: "login",
        password: "password",
        restaurantId: "1",
        restaurant: {
          address: "address",

          createdAt: new Date(),
          id: "1",
          latitude: 1,
          longitude: 1,
          name: "name",
          categoryId: "1",
          updatedAt: new Date(),
          organizationId: "1",
          logo: "logoUrl",
        },
      };

      const restaurant: Restaurant & { organization: Organization } = {
        address: "address",
        createdAt: new Date(),
        id: "1",
        latitude: 1,
        longitude: 1,
        name: "name",
        categoryId: "1",
        updatedAt: new Date(),
        organizationId: "1",
        logo: "logoUrl",
        organization: {
          id: "1",
          createdAt: new Date(),
          description: "description",
          name: "name",
          updatedAt: new Date(),
        },
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);
      prismaMock.platform.findFirst.mockResolvedValueOnce(platform);
      prismaMock.restaurant.findFirst.mockResolvedValueOnce(restaurant);

      await storyStatusHandler.handle();

      expect(storyScheduler.scheduleStory).toHaveBeenCalledTimes(1);
    });

    it("should not scheduleStory if status is DRAFT", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "create");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        status: "DRAFT",
        platformId: "1",
        name: "story1",
      };

      const platform: Platform & { restaurant: Restaurant } = {
        id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        key: "INSTAGRAM",
        login: "login",
        password: "password",
        restaurantId: "1",
        restaurant: {
          address: "address",

          createdAt: new Date(),
          id: "1",
          latitude: 1,
          longitude: 1,
          name: "name",
          categoryId: "1",
          updatedAt: new Date(),
          organizationId: "1",
          logo: "logoUrl",
        },
      };

      const restaurant: Restaurant & { organization: Organization } = {
        address: "address",
        createdAt: new Date(),
        id: "1",
        latitude: 1,
        longitude: 1,
        name: "name",
        categoryId: "1",
        updatedAt: new Date(),
        organizationId: "1",
        logo: "logoUrl",
        organization: {
          id: "1",
          createdAt: new Date(),
          description: "description",
          name: "name",
          updatedAt: new Date(),
        },
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);
      prismaMock.platform.findFirst.mockResolvedValueOnce(platform);
      prismaMock.restaurant.findFirst.mockResolvedValueOnce(restaurant);

      await storyStatusHandler.handle();

      expect(storyScheduler.scheduleStory).toHaveBeenCalledTimes(0);
    });
  });
  describe("_handleDelete", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should call deleteStorySchedule if story is SCHEDULED", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "delete");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        status: "SCHEDULED",
        platformId: "1",
        name: "story1",
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);

      await storyStatusHandler.handle();

      // deleteStorySchedule expect to have called
      expect(storyScheduler.deleteStorySchedule).toHaveBeenCalledTimes(1);
    });

    it("should not call deleteStorySchedule if story is PUBLISHED and publishedAt > last 24h", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "delete");

      const story: Story = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: DateTime.now().minus({ hours: 25 }).toJSDate(),
        status: "PUBLISHED",
        platformId: "1",
        name: "story1",
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);

      await storyStatusHandler.handle();

      // deleteStorySchedule expect to have called
      expect(storyScheduler.deleteStorySchedule).toHaveBeenCalledTimes(0);
    });

    it("should delete story in instagram if status = PUBLISHED and publishedAt <= last 24h", async () => {
      jest
        .spyOn(storyScheduler, "deleteStorySchedule")
        .mockResolvedValueOnce(true);
      const uniqueUUid = uuidv4();
      const storyId = uniqueUUid;
      const storyStatusHandler = new StoryStatusHandler(storyId, "delete");

      const story: Story & { posts: Post[]; platform: Platform } = {
        id: uniqueUUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: DateTime.now().minus({ hours: 10 }).toJSDate(),
        status: "PUBLISHED",
        platformId: "1",
        name: "story1",
        posts: [
          {
            convertedUrl: "https://www.google.com",
            createdAt: new Date(),
            id: "1",
            updatedAt: new Date(),
            storyId: uniqueUUid,
            name: "post1",
            originalUrl: "https://www.google.com",
            position: 1,
            socialPostId: "1",
            type: "IMAGE",
          },
        ],
        platform: {
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          key: "INSTAGRAM",
          login: "login",
          password: "password",
          restaurantId: "1",
        },
      };

      prismaMock.story.findUnique.mockResolvedValueOnce(story);

      await storyStatusHandler.handle();

      expect(IgApiClient).toHaveBeenCalled();
    });
  });
});
