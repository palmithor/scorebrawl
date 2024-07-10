import { env } from "@/env.mjs";
import type { User } from "@clerk/clerk-sdk-node";
import { createClerkClient } from "@clerk/nextjs/server";
import { db, users } from "@scorebrawl/db";
import { fullName } from "@scorebrawl/utils/string";

console.log("Fetching users from clerk to populate users table");

let clerkUsers: User[] = [];
let lastResponse: User[] = [];
let offset = 0;
const limit = 50;
const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
do {
  lastResponse = (
    await clerk.users.getUserList({
      limit,
      orderBy: "created_at",
      offset,
    })
  ).data;
  clerkUsers = [...clerkUsers, ...lastResponse];
  offset = offset + lastResponse.length;
} while (lastResponse.length > 0);

for (const user of clerkUsers) {
  if (user.firstName || user.lastName) {
    await db
      .insert(users)
      .values({
        id: user.id,
        name: fullName({ firstName: user.firstName, lastName: user.lastName }),
        imageUrl: user.imageUrl,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: fullName({
            firstName: user.firstName,
            lastName: user.lastName,
          }),
          imageUrl: user.imageUrl,
          updatedAt: new Date(user.updatedAt),
        },
      });
  }
}

console.log(`${clerkUsers.length} clerk users found and created/updated in db`);
process.exit(0);
