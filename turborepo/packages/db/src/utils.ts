import { init } from "@paralleldrive/cuid2";
import { cuidConfig } from "@scorebrawl/db";

export const createCuid = init(cuidConfig);
