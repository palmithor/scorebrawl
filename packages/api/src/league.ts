import z from "zod";

export const LeagueInputDTOSchema = z.object({
  name: z.string().min(0, { message: "Name is required" }),
  logoUrl: z.string().url(),
});
export type LeagueInputDTO = z.infer<typeof LeagueInputDTOSchema>;
