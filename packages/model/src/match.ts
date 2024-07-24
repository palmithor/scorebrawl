import z from "zod";

export const MatchResultSymbolSchema = z.union([z.literal("W"), z.literal("D"), z.literal("L")]);
export type MatchResultSymbol = z.infer<typeof MatchResultSymbolSchema>;

export const MatchInputSchema = z.object({
  leagueId: z.string().min(1),
  seasonId: z.string().min(1),
  homePlayerIds: z.string().array().nonempty(),
  awayPlayerIds: z.string().array().nonempty(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  userId: z.string(),
});
export type MatchInput = z.infer<typeof MatchInputSchema>;
