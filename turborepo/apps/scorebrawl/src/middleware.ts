import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  debug: process.env.DEBUG === "true",
  ignoredRoutes: ["/api/webhooks/(.*)", "/"],
  publicRoutes: ["/api/uploadthing"],
});

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
