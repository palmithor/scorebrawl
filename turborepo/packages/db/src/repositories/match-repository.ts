import { Player, TeamMatch } from "@ihs7/ts-elo";
import { CreateMatchInput, PageRequest } from "@scorebrawl/api";
import { and, eq, inArray } from "drizzle-orm";
import { getByIdWhereMember, getSeasonById, getSeasonPlayers } from ".";
import {
  ScoreBrawlError,
  createCuid,
  db,
  matchPlayers,
  matches,
  seasonPlayers,
  seasonTeams,
  teamMatches,
} from "..";
import { getOrInsertTeam } from "./team-repository";

export const createMatch = async ({
  seasonId,
  homePlayerIds,
  awayPlayerIds,
  homeScore,
  awayScore,
  userId,
}: CreateMatchInput) => {
  const season = await getSeasonById({
    seasonId: seasonId,
    userId: userId,
  });
  const league = await getByIdWhereMember({
    leagueId: season.leagueId,
    userId: userId,
    allowedRoles: ["member", "owner", "editor"],
  });
  if (!league) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "league access denied",
    });
  }
  if (league.archived) {
    throw new ScoreBrawlError({
      code: "CONFLICT",
      message: "league is archived",
    });
  }

  if (homePlayerIds.length !== awayPlayerIds.length) {
    throw new ScoreBrawlError({
      code: "BAD_REQUEST",
      message: "Team sizes must be equal",
    });
  }

  const homeSeasonPlayers = await findAndValidateSeasonPlayers({
    seasonId: season.id,
    seasonPlayerIds: homePlayerIds,
  });

  const awaySeasonPlayers = await findAndValidateSeasonPlayers({
    seasonId: season.id,
    seasonPlayerIds: awayPlayerIds,
  });

  const now = new Date();
  return db.transaction(async (tx) => {
    const {
      eloMatchResult: individualMatchResult,
      eloHomeTeam: individualHomeTeamElo,
      eloAwayTeam: individualAwayTeamElo,
    } = calculateMatchResult({
      kFactor: season.kFactor,
      homeScore: homeScore,
      awayScore: awayScore,
      homePlayers: homeSeasonPlayers,
      awayPlayers: awaySeasonPlayers,
    });

    const match = await tx
      .insert(matches)
      .values({
        id: createCuid(),
        homeScore: homeScore,
        awayScore: awayScore,
        homeExpectedElo: individualHomeTeamElo.expectedScoreAgainst(individualAwayTeamElo),
        awayExpectedElo: individualAwayTeamElo.expectedScoreAgainst(individualHomeTeamElo),
        seasonId: season.id,
        createdBy: userId,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    let homeTeamResult: "W" | "L" | "D" = "D";
    let awayTeamResult: "W" | "L" | "D" = "D";
    if (homeScore > awayScore) {
      homeTeamResult = "W";
      awayTeamResult = "L";
    } else if (homeScore < awayScore) {
      homeTeamResult = "L";
      awayTeamResult = "W";
    }

    const matchPlayerValues = [
      ...awaySeasonPlayers.map((player) => ({
        id: createCuid(),
        matchId: match.id,
        eloBefore: player.elo,
        eloAfter: individualMatchResult.results.find((r) => r.identifier === player.id)?.rating,
        seasonPlayerId: player.id,
        homeTeam: false,
        result: awayTeamResult,
        createdAt: now,
        updatedAt: now,
      })),
      ...homeSeasonPlayers.map((player) => ({
        id: createCuid(),
        matchId: match.id,
        eloBefore: player.elo,
        eloAfter: individualMatchResult.results.find((r) => r.identifier === player.id)?.rating,
        seasonPlayerId: player.id,
        homeTeam: true,
        result: homeTeamResult,
        createdAt: now,
        updatedAt: now,
      })),
    ];
    await tx.insert(matchPlayers).values(matchPlayerValues).run();

    for (const playerResult of individualMatchResult.results) {
      await tx
        .update(seasonPlayers)
        .set({ elo: playerResult.rating })
        .where(eq(seasonPlayers.id, playerResult.identifier))
        .run();
    }

    if (homeSeasonPlayers.length > 1 && awaySeasonPlayers.length > 1) {
      const { seasonTeamId: homeSeasonTeamId, elo: homeSeasonTeamElo } = await getOrInsertTeam(tx, {
        season,
        now,
        players: homeSeasonPlayers,
      });
      const { seasonTeamId: awaySeasonTeamId, elo: awaySeasonTeamElo } = await getOrInsertTeam(tx, {
        season,
        now,
        players: awaySeasonPlayers,
      });

      const { eloMatchResult: teamMatchResult } = calculateMatchResult({
        kFactor: season.kFactor,
        homeScore: homeScore,
        awayScore: awayScore,
        homePlayers: [{ id: homeSeasonTeamId, elo: homeSeasonTeamElo }],
        awayPlayers: [{ id: awaySeasonTeamId, elo: awaySeasonTeamElo }],
      });

      await tx
        .insert(teamMatches)
        .values([
          {
            id: createCuid(),
            matchId: match.id,
            seasonTeamId: homeSeasonTeamId,
            eloBefore: homeSeasonTeamElo,
            eloAfter: teamMatchResult.results.find((r) => r.identifier === homeSeasonTeamId)
              ?.rating,
            result: homeTeamResult,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: createCuid(),
            matchId: match.id,
            seasonTeamId: awaySeasonTeamId,
            eloBefore: awaySeasonTeamElo,
            eloAfter: teamMatchResult.results.find((r) => r.identifier === awaySeasonTeamId)
              ?.rating,
            result: awayTeamResult,
            createdAt: now,
            updatedAt: now,
          },
        ])
        .run();

      for (const teamResult of teamMatchResult.results) {
        await tx
          .update(seasonTeams)
          .set({ elo: teamResult.rating })
          .where(eq(seasonTeams.id, teamResult.identifier))
          .run();
      }
    }

    return match;
  });
};

export const getMatchesBySeasonId = async ({
  seasonId,
  userId,
  limit = 15,
  page = 1,
}: { seasonId: string; userId: string } & PageRequest) => {
  const season = await getSeasonById({
    seasonId: seasonId,
    userId: userId,
  });
  const seasonMatches = await db.query.matches.findMany({
    where: (match, { eq }) => eq(match.seasonId, season.id),
    orderBy: (match, { desc }) => [desc(match.createdAt)],
    limit,
    offset: (page - 1) * limit,
    with: {
      matchPlayers: {
        with: {
          seasonPlayer: {
            with: {
              leaguePlayer: {
                columns: { userId: true },
                with: { user: { columns: { name: true, imageUrl: true } } },
              },
            },
          },
        },
      },
    },
  });
  return {
    data: seasonMatches.map(toMatchObj),
  };
};

const findAndValidateSeasonPlayers = async ({
  seasonId,
  seasonPlayerIds,
}: {
  seasonId: string;
  seasonPlayerIds: string[];
}) => {
  const players = await db.query.seasonPlayers.findMany({
    where: and(eq(seasonPlayers.seasonId, seasonId), inArray(seasonPlayers.id, seasonPlayerIds)),
    with: {
      leaguePlayer: {
        columns: { id: true },
        with: { user: { columns: { name: true } } },
      },
    },
  });
  if (players.length !== seasonPlayerIds.length) {
    throw new ScoreBrawlError({
      code: "BAD_REQUEST",
      message: "some players in home team not part of season",
    });
  }
  return players;
};

const calculateMatchResult = ({
  kFactor,
  homeScore,
  awayScore,
  homePlayers,
  awayPlayers,
}: {
  kFactor: number;
  homeScore: number;
  awayScore: number;
  homePlayers: { id: string; elo: number }[];
  awayPlayers: { id: string; elo: number }[];
}) => {
  const eloIndividualMatch = new TeamMatch({ kFactor });
  const eloHomeTeam = eloIndividualMatch.addTeam("home", homeScore);
  for (const p of homePlayers) {
    eloHomeTeam.addPlayer(new Player(p.id, p.elo));
  }
  const eloAwayTeam = eloIndividualMatch.addTeam("away", awayScore);
  for (const p of awayPlayers) {
    eloAwayTeam.addPlayer(new Player(p.id, p.elo));
  }
  const eloMatchResult = eloIndividualMatch.calculate();
  return { eloHomeTeam, eloAwayTeam, eloMatchResult };
};

const toMatchObj = (match: {
  id: string;
  homeScore: number;
  awayScore: number;
  homeExpectedElo: number;
  awayExpectedElo: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  matchPlayers: {
    homeTeam: boolean;
    seasonPlayer: {
      id: string;
      elo: number;
      createdAt: Date;
      disabled: boolean;
      leaguePlayer: {
        userId: string;
        user: { name: string | null; imageUrl: string | null };
      };
    };
  }[];
}) => ({
  id: match.id,
  homeTeam: {
    score: match.homeScore,
    expectedElo: match.homeExpectedElo,
    players: match.matchPlayers
      .filter((p) => p.homeTeam)
      .map((p) => ({
        id: p.seasonPlayer.id,
        userId: p.seasonPlayer.leaguePlayer.userId,
        elo: p.seasonPlayer.elo,
        joinedAt: p.seasonPlayer.createdAt,
        disabled: p.seasonPlayer.disabled,
        name: p.seasonPlayer.leaguePlayer.user?.name ?? "",
        imageUrl: p.seasonPlayer.leaguePlayer.user?.imageUrl ?? "",
      })),
  },
  awayTeam: {
    score: match.awayScore,
    expectedElo: match.awayExpectedElo,
    players: match.matchPlayers
      .filter((p) => !p.homeTeam)
      .map((p) => ({
        id: p.seasonPlayer.id,
        userId: p.seasonPlayer.leaguePlayer.userId,
        elo: p.seasonPlayer.elo,
        joinedAt: p.seasonPlayer.createdAt,
        disabled: p.seasonPlayer.disabled,
        name: p.seasonPlayer.leaguePlayer.user?.name ?? "",
        imageUrl: p.seasonPlayer.leaguePlayer.user?.imageUrl ?? "",
      })),
  },
  createdBy: match.createdBy,
  updatedBy: match.updatedBy,
  createdAt: match.createdAt,
  updatedAt: match.updatedAt,
});
