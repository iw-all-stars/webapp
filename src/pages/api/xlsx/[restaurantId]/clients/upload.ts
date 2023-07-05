/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type Prisma } from "@prisma/client";
import { IncomingForm, type File as FormidableFile } from "formidable";
import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import XLSX, { type WorkSheet } from "xlsx";
import { prisma } from "~/server/db";
import { type Client } from "./template";
import { Client as ClientElk } from "@elastic/elasticsearch";
import { elkOptions } from "~/utils/elkClientOptions";

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
    if (!req.file || !req.file.filepath || !req.query.restaurantId) {
      return res.status(400).json({ message: "Bad request" });
    }

    if (!req.file.mimetype?.includes("sheet")) {
      return res.status(400).json({ message: "Le fichier doit être au format Excel (.xslx)." });
    }

    try {
      const buffer = await fs.readFile(req.file.filepath);
      const workbook = XLSX.read(buffer, { type: "buffer" });

      if (!workbook.SheetNames.length) {
        return res.status(400).json({ message: "Le fichier est vide. Veuillez télécharger le fichier modèle et réessayer." });
      }

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return res.status(400).json({ message: "Le fichier est vide. Veuillez télécharger le fichier modèle et réessayer." });
      }

      const expectedHeaders = [
        "Nom",
        "Prenom",
        "Email",
      ];

      const firstRow = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName] as WorkSheet, {
        header: 1,
        range: 0,
      })[0];

      if (!firstRow) {
        return res.status(400).json({ message: "Fichier invalide. Veuillez télécharger le fichier modèle et réessayer." });
      }
      const headers = Object.values(firstRow);

      if (headers.length !== expectedHeaders.length) {
        return res.status(400).json({ message: "Le format des colonnes n'est pas respecté. Veuillez télécharger le fichier modèle et réessayer." });
      }

      for (let i = 0; i < headers.length; i++) {
        if (headers[i] !== expectedHeaders[i]) {
          return res.status(400).json({ message: "Le format des colonnes n'est pas respecté. Veuillez télécharger le fichier modèle et réessayer." });
        }
      }

      const clientElk = new ClientElk(elkOptions);

      const worksheet: WorkSheet = workbook.Sheets[firstSheetName] as WorkSheet;
      const data: Client[] = XLSX.utils.sheet_to_json(worksheet);

      const createClients: Prisma.ClientCreateManyInput[] = [];

      for (const client of data) {
        createClients.push({
          email: String(client.Email),
          firstname: String(client.Prenom),
          name: String(client.Nom),
          restaurantId: req.query.restaurantId as string,
        });
      }

      await prisma.client.createMany({
        data: createClients,
        skipDuplicates: true,
      });

      const clientsCreated = await prisma.client.findMany({
        where: {
          email: {
            in: createClients.map((client) => client.email),
          }
        }
      });

      await clientElk.bulk({
        index: "clients",
        refresh: true,
        body: clientsCreated.flatMap(client => [
          { index: { _index: "clients", _id: client.id } },
          client
        ]),
      });

      await clientElk.close();

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
