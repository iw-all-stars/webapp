import withAuth from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});
export const config = {
  matcher: [
    "/dashboard/:page*",
    "/",
    "/notifications",
    "/404",
    "/auth/:page*",
    "/api/s3/:page*",
    "/api/trpc/:page*",
    "/api/xlsx/:page*",
  ],
};
