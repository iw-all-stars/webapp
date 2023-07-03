import { type PrismaClient, type Client as ModelClient } from "@prisma/client";
import prismaInstance from './client.prisma';
import { Client as ClientElk } from "@elastic/elasticsearch";
import { env } from "../env.mjs";

const clientElk = new ClientElk({
    node: "http://localhost:9200",
    auth: {
        username: "elastic",
        password: "elastic_password"
    }
})

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const prismaClient =
    globalForPrisma.prisma ??
    prismaInstance;

prismaClient.$use(async (params, next) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await next(params);

  if (params.model === "Client") {
    if (params.action === "create") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const newClient: ModelClient = structuredClone(result);

        const { id, ...restNewClient } = newClient;
        // console.log('test', id)
        await clientElk.create({
            index: "clients",
            id,
            document: { ...restNewClient }
        })
    } else if (params.action === "update") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const updatedClient: ModelClient = structuredClone(result);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const { id, ...restUpdatedClient } = updatedClient;
        await clientElk.update({
            index: "clients",
            id,
            doc: { ...restUpdatedClient }
        })
    } else if (params.action === "delete") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const deletedClient: ModelClient = result;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const { id } = deletedClient;
        await clientElk.delete({
            index: "clients",
            id,
        })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
});

export const prisma = prismaClient;

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
