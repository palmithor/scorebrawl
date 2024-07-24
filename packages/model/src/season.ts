import z from "zod";

export const ScoreTypeSchema = z.union([
  z.literal("elo"),
  z.literal("3-1-0"),
  z.literal("elo-individual-vs-team"),
]);
export type ScoreType = z.infer<typeof ScoreTypeSchema>;

export const EloTypeSchema = z.union([z.literal("team vs team"), z.literal("individual vs team")]);
export const EloTypeEnumSchema = z.enum(["team vs team", "individual vs team"]);
export type EloType = z.infer<typeof EloTypeSchema>;

export const SeasonCreateSchema = z.object({
  name: z.string().min(0),
  scoreType: ScoreTypeSchema,
  leagueId: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  initialScore: z.coerce.number().int(),
  kFactor: z.coerce.number().int(),
  userId: z.string(),
});
export type SeasonCreate = z.infer<typeof SeasonCreateSchema>;

export const SeasonEditSchema = z.object({
  seasonId: z.string(),
  userId: z.string(),
  name: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  initialScore: z.number().optional(),
  scoreType: ScoreTypeSchema.optional(),
  kFactor: z.number().optional(),
});
