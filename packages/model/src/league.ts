import z from "zod";

export const LeagueInput = z.object({
  userId: z.string(),
  name: z.string().min(0),
  logoUrl: z.string().url(),
});
