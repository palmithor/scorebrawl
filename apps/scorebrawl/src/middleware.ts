import { editorRoles } from "@/utils/permissionUtil";
import { authMiddleware } from "@clerk/nextjs";
import { LeagueRepository } from "@scorebrawl/db";
import { NextResponse } from "next/server";

const leaguePageRegex = /^\/leagues\/([^\/]+)\/([^\/]+)(?:\/.*)?$/;
const pagesRequiringEditor = ["members", "invites", "edit"];

export default authMiddleware({
  debug: process.env.DEBUG === "true",
  ignoredRoutes: ["/api/webhooks/(.*)"],
  publicRoutes: ["/api/uploadthing", "/api/public/(.*)"],

  afterAuth: async (req, res, _next) => {
    const match = res.nextUrl.pathname.match(leaguePageRegex);
    if (match) {
      const leagueSlug = match[1] as string;
      const leaguePage = match[2] as string;
      const league = await LeagueRepository.getLeagueBySlugWithMembership({
        userId: req.userId ?? "",
        leagueSlug,
      });
      if (!league) {
        return NextResponse.redirect(new URL("/?errorCode=LEAGUE_NOT_FOUND", res.nextUrl.origin));
      }
      if (pagesRequiringEditor.includes(leaguePage) && !editorRoles.includes(league.role)) {
        return NextResponse.redirect(
          new URL(`/leagues/${leagueSlug}?errorCode=LEAGUE_PERMISSION`, res.nextUrl.origin),
        );
      }
    }
  },
});

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
