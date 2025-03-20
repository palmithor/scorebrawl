export const cuidConfig = { length: 32 };
import { init } from "@paralleldrive/cuid2";

export const createCuid = init(cuidConfig);
