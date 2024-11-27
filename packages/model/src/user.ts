import z from "zod";

export const User = z.object({
  userId: z.string(),
  name: z.string(),
  imageUrl: z.string().nullish(),
  defaultLeagueId: z.string().optional(),
});
