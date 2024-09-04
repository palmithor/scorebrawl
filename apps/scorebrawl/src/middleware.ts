import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const _isLeagueRoute = createRouteMatcher(["/leagues/(.*)"]);

const _isEditorRoute = createRouteMatcher([
  "/leagues/(.*)/members(.*)",
  "/leagues/(.*)/invites(.*)",
  "/leagues/(.*)/edit(.*)",
]);
const isPublicRoute = createRouteMatcher([
  "/api/uploadthing",
  "/api/public/(.*)",
  "/api/webhooks/(.*)",
  "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
