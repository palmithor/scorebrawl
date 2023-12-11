import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  debug: process.env.CLERK_DEBUG === "true",
  ignoredRoutes: ["/api/webhooks/(.*)"],
});

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
