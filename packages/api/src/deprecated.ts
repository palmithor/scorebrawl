import z from "zod";

const leagueMemberRoleSchema = z.enum(["viewer", "member", "editor", "owner"]);
export const createInviteSchema = z.object({
  leagueSlug: z.string(),
  role: leagueMemberRoleSchema,
  // min date should be 15 minutes from now
  expiresAt: z
    .date()
    .min(new Date(Date.now() + 15 * 60 * 1000))
    .optional(),
});

export type LeagueMemberRole = z.infer<typeof leagueMemberRoleSchema>;
