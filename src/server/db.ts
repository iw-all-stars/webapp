import { Client as ClientElk } from "@elastic/elasticsearch";
import { type Client as ModelClient, type PrismaClient } from "@prisma/client";
import prismaInstance from "./client.prisma";

import { elkOptions } from "~/utils/elkClientOptions";
import { env } from "../env.mjs";

const clientElk = new ClientElk(elkOptions);

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

      try {
        await clientElk.update({
          index: "clients",
          id,
          refresh: true,
          doc: { ...restUpdatedClient },
        });
      } catch (error) {
        return error;
      }
    } else if (params.action === "delete") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const deletedClient: ModelClient = result;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const { id } = deletedClient;
        await clientElk.delete({
          index: "clients",
          refresh: true,
          id,
        });
      } catch (error) {
        return error;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
});

export const prisma = prismaClient;

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
