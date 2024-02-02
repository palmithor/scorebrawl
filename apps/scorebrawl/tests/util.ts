import { faker } from "@faker-js/faker";
import { db, users } from "@scorebrawl/db";
import { fullName } from "@scorebrawl/utils/string";

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
