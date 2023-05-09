import { type NextApiRequest, type NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    res.status(200).json({ test: 'hello' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};