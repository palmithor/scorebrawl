import z from "zod";

export const matchResultSymbol = ["W", "D", "L"] as const;
export type MatchResultSymbol = (typeof matchResultSymbol)[number];
export const scoreType = ["elo", "3-1-0", "elo-individual-vs-team"] as const;
export type ScoreType = (typeof scoreType)[number];
export const eloType = ["team vs team", "individual vs team"] as const;
export type EloType = (typeof eloType)[number];

export const createLeagueSchema = z.object({
  userId: z.string(),
  name: z.string().min(0, { message: "Name is required" }),
  logoUrl: z.string().url(),
});

export const updateTeamSchema = z.object({
  teamId: z.string(),
  leagueId: z.string(),
  userId: z.string(),
  name: z.string().min(0, { message: "Name is required" }),
});

export const createSeasonSchema = z.object({
  name: z.string().min(0, "Name is required"),
  scoreType: z.enum(scoreType).default("elo"),
  leagueId: z.string(),
  startDate: z.date().optional().default(new Date()),
  endDate: z.date().optional(),
  initialScore: z.coerce.number().int().min(100).default(1200),
  kFactor: z.coerce.number().int().min(10).max(50).default(32),
  userId: z.string(),
});

export const createMatchSchema = z.object({
  seasonId: z.string().min(1),
  homePlayerIds: z.string().array().nonempty(),
  awayPlayerIds: z.string().array().nonempty(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  userId: z.string(),
});

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type PageRequest = {
  search?: string;
  page?: number;
  limit?: number;
};

export type PlayerForm = MatchResultSymbol[];
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
