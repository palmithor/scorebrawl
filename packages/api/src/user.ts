import z from "zod";

export const UserDTO = z.object({
  userId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  defaultLeagueId: z.string().optional(),
});
