import { type NextApiRequest, type NextApiResponse } from "next";
import XLSX from "xlsx";

export interface Client {
  Nom: string;
  Prenom: string;
  Email: string;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const columns = ["Nom", "Prenom", "Email"];

    const worksheet = XLSX.utils.json_to_sheet([], { header: columns });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=Template_Clients.xlsx");

    res.send(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};
