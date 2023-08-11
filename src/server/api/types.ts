import { type User } from "@clerk/nextjs/dist/types/server";
import { type SeasonPlayer } from "../db/types";

export type SeasonPlayerUser = { user: User; seasonPlayer: SeasonPlayer };
