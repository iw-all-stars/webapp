/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type Prisma } from "@prisma/client";
import { IncomingForm, type File as FormidableFile } from "formidable";
import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import XLSX, { type WorkSheet } from "xlsx";
import { prisma } from "~/server/db";
import { type Client } from "./template";

interface File extends FormidableFile {
  path?: string;
}

interface CustomError extends Error {
  statusCode?: number;
}

function isErrorWithStatusCode(err: unknown): err is CustomError {
  return err instanceof Error && "statusCode" in err;
}

const router = createRouter<
  NextApiRequest & { file?: File },
  NextApiResponse
>();

router
  .use(async (req, res, next) => {
    const form = new IncomingForm();

    await new Promise<void>((resolve, reject) => {
      form
        .on("error", (err) => {
          reject(err);
        })
        .on("field", (name, value) => {
          req.body[name] = value;
        })
        .on("file", (name, file) => {
          req.file = file as File;
        })
        .on("end", () => {
          resolve();
        });

      form.parse(req);
    });

    next();
  })
  .post(async (req, res) => {
    if (!req.file || !req.file.filepath) {
      return res.status(400).json({ message: "Missing file" });
    }

    try {
      const buffer = await fs.readFile(req.file.filepath);
      const workbook = XLSX.read(buffer, { type: "buffer" });

      if (!workbook.SheetNames.length) {
        return res.status(400).json({ message: "File is empty" });
      }

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return res.status(400).json({ message: "File is empty" });
      }

      const worksheet: WorkSheet = workbook.Sheets[firstSheetName] as WorkSheet;
      const data: Client[] = XLSX.utils.sheet_to_json(worksheet);

      const createClients: Prisma.ClientCreateManyInput[] = [];

      for (const client of data) {
        createClients.push({
          email: String(client.Email),
          firstname: String(client.Prenom),
          name: String(client.Nom),
          phone: String(client.Téléphone),
          address: String(client.Adresse),
          city: String(client.Ville),
          zip: String(client["Code postal"]),
        });
      }

      await prisma.client.createMany({
        data: createClients,
        skipDuplicates: true,
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: String(err) });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default router.handler({
  onError: (err, req, res) => {
    if (isErrorWithStatusCode(err)) {
      console.error(err.stack);
      res.status(err.statusCode || 500).end(err.message);
    } else if (err instanceof Error) {
      console.error(err.stack);
      res.status(500).end(err.message);
    } else {
      console.error(err);
      res.status(500).end("An error occurred.");
    }
  },
});
