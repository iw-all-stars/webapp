import { verify } from "jsonwebtoken";

export async function validateAuth0(authorizationHeader: string) {
  const publicKey = await fetch(process.env.AUTH0_PEM_URL as string);

  const blob = await publicKey.blob();

  return new Promise(async (resolve, reject) => {
    const token = authorizationHeader.split(" ")[1];
    if (!token) reject("No token provided");

    if (token)
      verify(
        token,
        await blob.text(),
        { algorithms: ["RS256"] },
        (err, decoded) => {
          if (err) {
            reject(err);
          }

          resolve(decoded);
        }
      );
  });
}
