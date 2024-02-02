import z from "zod";

export const create = z.object({
  seasonId: z.string().nonempty(),
  homePlayerIds: z.string().array().nonempty(),
  awayPlayerIds: z.string().array().nonempty(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
});
