import z from "zod";

export const LeagueInputSchema = z.object({
  userId: z.string(),
  name: z.string().min(0),
  logoUrl: z.string().url(),
});
export type LeagueInput = z.infer<typeof LeagueInputSchema>;
