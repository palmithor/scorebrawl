import { editorRoles } from "@/utils/permissionUtil";
import { authMiddleware } from "@clerk/nextjs";
import { LeagueRepository } from "@scorebrawl/db";
import { NextResponse } from "next/server";

const leaguePageRegex = /^\/leagues\/([^\/]+)\/([^\/]+)(?:\/.*)?$/;
const pagesRequiringEditor = ["members", "invites", "edit"];

export default authMiddleware({
  ignoredRoutes: ["/api/webhooks/(.*)"],
  publicRoutes: ["/api/uploadthing", "/api/public/(.*)"],

  afterAuth: async (auth, req) => {
    const match = req.nextUrl.pathname.match(leaguePageRegex);
    if (match) {
      const leagueSlug = match[1] as string;
      const leaguePage = match[2] as string;
      const league = await LeagueRepository.getLeagueBySlugWithMembership({
        userId: auth.userId ?? "",
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
    return NextResponse.next();
  },
});

// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
