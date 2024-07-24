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

export const updateTeamSchema = z.object({
  teamId: z.string(),
  leagueId: z.string(),
  userId: z.string(),
  name: z.string().min(0, { message: "Name is required" }),
});

export const createMatchSchema = z.object({
  seasonId: z.string().min(1),
  homePlayerIds: z.string().array().nonempty(),
  awayPlayerIds: z.string().array().nonempty(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  userId: z.string(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

export type LeagueMemberRole = z.infer<typeof leagueMemberRoleSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
