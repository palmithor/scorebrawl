import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { matchPlayers } from "~/server/db/schema";

const matchPlayerList = await db.query.matchPlayers.findMany({
  with: { match: true },
});

for (const mp of matchPlayerList) {
  let result: "D" | "W" | "L" = "D";
  if (mp.match.homeScore === mp.match.awayScore) {
    result = "D";
  } else if (
    (mp.match.homeScore > mp.match.awayScore && mp.homeTeam) ||
    (mp.match.awayScore > mp.match.homeScore && !mp.homeTeam)
  ) {
    result = "W";
  } else {
    result = "L";
  }
  await db.update(matchPlayers).set({ result }).where(eq(matchPlayers.id, mp.id));
}
