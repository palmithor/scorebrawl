import { editorRoles } from "@/utils/permissionUtil";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { LeagueRepository } from "@scorebrawl/db";
import { NextResponse } from "next/server";

const leaguePageRegex = /^\/leagues\/([^\/]+)\/([^\/]+)(?:\/.*)?$/;
const pagesRequiringEditor = ["members", "invites", "edit"];

const isEditorRoute = createRouteMatcher([
  "/leagues/(.*)/members(.*)",
  "/leagues/(.*)/invites(.*)",
  "/leagues/(.*)/edit(.*)",
]);
const isPublicRoute = createRouteMatcher([
  "/api/uploadthing",
  "/api/public/(.*)",
  "/api/webhooks/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
    if (isEditorRoute(req)) {
      const match = req.nextUrl.pathname.match(leaguePageRegex);
      if (match) {
        const leagueSlug = match[1] as string;
        const leaguePage = match[2] as string;
        const league = await LeagueRepository.getLeagueBySlugWithMembership({
          userId: auth().userId as string,
          leagueSlug,
        });
        if (!league) {
          return NextResponse.redirect(new URL("/?errorCode=LEAGUE_NOT_FOUND", req.nextUrl.origin));
        }
        if (pagesRequiringEditor.includes(leaguePage) && !editorRoles.includes(league.role)) {
          return NextResponse.redirect(
            new URL(`/leagues/${leagueSlug}?errorCode=LEAGUE_PERMISSION`, req.nextUrl.origin),
          );
        }
      }
    }
  }
});

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
