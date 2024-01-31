import z from "zod";

export const createLeagueSchema = z.object({
  userId: z.string(),
  name: z.string().min(0, { message: "Name is required" }),
  logoUrl: z.string().url(),
  visibility: z.enum(["public", "private"]),
});

export const createSeasonSchema = z.object({
  name: z.string().min(0, "Name is required"),
  leagueId: z.string(),
  startDate: z.date().optional().default(new Date()),
  endDate: z.date().optional(),
  initialElo: z.coerce.number().int().min(100).default(1200),
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
export type MatchResult = "W" | "D" | "L";
export type PlayerForm = MatchResult[];
