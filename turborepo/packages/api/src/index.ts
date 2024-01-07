import z from "zod";

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;

export const createLeagueSchema = z.object({
  userId: z.string(),
  name: z.string().min(0, { message: "Name is required" }),
  logoUrl: z.string().url(),
  visibility: z.enum(["public", "private"]),
});
