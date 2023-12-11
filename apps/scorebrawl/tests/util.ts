import { type SignedInAuthObject } from "@clerk/nextjs/server";
import { faker } from "@faker-js/faker";
import { fullName } from "~/lib/string-utils";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const userId = "userId";

export const insertAuthUser = async () => {
  await db
    .insert(users)
    .values({
      id: userId,
      name: fullName({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      }),
      imageUrl: faker.image.avatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .run();
};

export const testCtx = createInnerTRPCContext({
  auth: { userId } as SignedInAuthObject,
});
