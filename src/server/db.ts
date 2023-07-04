import { Client as ClientElk } from "@elastic/elasticsearch";
import { type Client as ModelClient, type PrismaClient } from "@prisma/client";
import { env } from "../env.mjs";
import prismaInstance from "./client.prisma";
import dbConnect from "./mongoose";

const clientElk = new ClientElk({
  node: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200",
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME ?? "elastic",
    password: process.env.ELASTICSEARCH_PASSWORD ?? "changeme",
  },
});

dbConnect().catch(console.error);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient = globalForPrisma.prisma ?? prismaInstance;

prismaClient.$use(async (params, next) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await next(params);

  if (params.model === "Client") {
    if (params.action === "create") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newClient: ModelClient = structuredClone(result);

      const { id, ...restNewClient } = newClient;

      try {
        await clientElk.get<ModelClient>({
          index: "clients",
          id,
        });
      } catch (error) {
        await clientElk.create({
          index: "clients",
          id,
          refresh: true,
          document: { ...restNewClient },
        });
      }
    } else if (params.action === "update") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updatedClient: ModelClient = structuredClone(result);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const { id, ...restUpdatedClient } = updatedClient;

      await clientElk.update({
        index: "clients",
        id,
        refresh: true,
        doc: { ...restUpdatedClient },
      });
    } else if (params.action === "delete") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const deletedClient: ModelClient = result;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const { id } = deletedClient;
      await clientElk.delete({
        index: "clients",
        refresh: true,
        id,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
});

export const prisma = prismaClient;

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
