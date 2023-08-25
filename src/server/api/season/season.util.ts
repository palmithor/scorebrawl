import { type SeasonPlayer } from "~/server/db/types";
import clerk from "@clerk/clerk-sdk-node";
import { type SeasonPlayerUser } from "~/server/api/types";

export const populateSeasonUserPlayer = async ({
  seasonPlayers,
}: {
  seasonPlayers: (SeasonPlayer & { leaguePlayer: { userId: string } })[];
}) => {
  const clerkUsers = await clerk.users.getUserList({
    limit: seasonPlayers.length,
    userId: seasonPlayers.map((p) => p.leaguePlayer.userId),
  });
  return seasonPlayers
    .map((player) => {
      const user = clerkUsers.find(
        (user) => user.id === player.leaguePlayer.userId
      );

      if (user) {
        return {
          id: player.id,
          userId: user.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          imageUrl: user.imageUrl,
          elo: player.elo,
          joinedAt: player.createdAt,
          disabled: player.disabled,
        };
      }
    })
    .filter((item): item is SeasonPlayerUser => !!item);
};
