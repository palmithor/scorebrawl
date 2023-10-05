import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  debug: process.env.CLERK_DEBUG === "true",
  publicRoutes: ["/api/webhooks(.*)"],
});

// Stop Middleware running on static files
export const config = {
  matcher: "/((?!_next/image|_next/static|favicon.ico).*)",
};
