import { PlayerFormSchema } from "@scorebrawl/model";
import { z } from "zod";
import { UserDTO } from "./user";

export const SeasonPlayerDTO = z.object({
  seasonPlayerId: z.string(),
  leaguePlayerId: z.string(),
  user: UserDTO,
});

export const SeasonPlayerStandingDTO = z
  .object({
    score: z.number(),
    matchCount: z.number(),
    winCount: z.number(),
    lossCount: z.number(),
    drawCount: z.number(),
    form: PlayerFormSchema,
    pointDiff: z.number().optional(),
  })
  .merge(SeasonPlayerDTO);
