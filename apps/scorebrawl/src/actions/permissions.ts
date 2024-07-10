import type { LeagueMemberRole } from "@scorebrawl/api";
import { ScoreBrawlError } from "@scorebrawl/db";

type LeagueWithUserRole = {
  id: string;
  slug: string;
  role: "viewer" | "member" | "editor" | "owner";
};

export const validateMembership = ({
  leagueWithMembership,
  allowedRoles,
}: { leagueWithMembership?: LeagueWithUserRole; allowedRoles: LeagueMemberRole[] }) => {
  if (!leagueWithMembership) {
    return false;
  }
  if (!allowedRoles.includes(leagueWithMembership.role)) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this league",
    });
  }
};
