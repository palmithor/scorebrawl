import { fullName } from "@scorebrawl/utils/string";
import { db } from "../db";
import { users } from "../schema";

const findUserById = async ({ id }: { id: string }) => {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    columns: { id: true },
  });
};

const upsertUser = async ({
  id,
  firstName,
  lastName,
  imageUrl,
  createdAt,
  updatedAt,
}: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}) => {
  await db
    .insert(users)
    .values({
      id,
      name: fullName({
        firstName,
        lastName,
      }),
      imageUrl: imageUrl,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: fullName({
          firstName,
          lastName,
        }),
        imageUrl: imageUrl,
        updatedAt: new Date(updatedAt),
      },
    });
};

export const UserRepository = { findUserById, upsertUser };
