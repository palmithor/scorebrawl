import { Player, TeamMatch } from "@ihs7/ts-elo";
import { CreateMatchInput, MatchResultSymbol, PageRequest } from "@scorebrawl/api";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getByIdWhereMember, getLeagueById, getSeasonById } from ".";
import {
  ScoreBrawlError,
  createCuid,
  db,
  matchPlayers,
  matches,
  seasonPlayers,
  seasonTeams,
  seasons,
  teamMatches,
} from "..";
import { Match, MatchPlayer } from "../types";
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
}: { seasonId: string; userId: string } & PageRequest): Promise<{ data: Match[] }> => {
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
        columns: { id: true, homeTeam: true, result: true, seasonPlayerId: true },
        with: {
          seasonPlayer: {
            columns: { id: true, elo: true, leaguePlayerId: true },
            with: {
              leaguePlayer: {
                columns: {},
                with: { user: { columns: { id: true, name: true, imageUrl: true } } },
              },
            },
          },
        },
      },
    },
  });
  return {
    data: seasonMatches.map((match) => ({
      id: match.id,
      homeTeam: {
        score: match.homeScore,
        expectedElo: match.homeExpectedElo,
        result: match.matchPlayers.find((p) => p.homeTeam)?.result as MatchResultSymbol,
        players: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => p.homeTeam) }),
      },
      awayTeam: {
        score: match.awayScore,
        expectedElo: match.awayExpectedElo,
        result: match.matchPlayers.find((p) => !p.homeTeam)?.result as MatchResultSymbol,
        players: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => !p.homeTeam) }),
      },
      seasonId: match.seasonId,
      createdAt: match.createdAt,
      createdBy: match.createdBy,
    })),
  };
};

export const getLatestMatch = async ({
  leagueId,
  userId,
}: { leagueId: string; userId: string }): Promise<Match | undefined> => {
  const league = await getLeagueById({ leagueId, userId });

  const match = await db.query.matches.findFirst({
    where: (match, { inArray }) =>
      inArray(
        match.seasonId,
        db.select({ id: seasons.id }).from(seasons).where(eq(seasons.leagueId, league.id)),
      ),
    with: {
      matchPlayers: {
        columns: { id: true, homeTeam: true, result: true, seasonPlayerId: true },
        with: {
          seasonPlayer: {
            columns: { id: true, elo: true, leaguePlayerId: true },
            with: {
              leaguePlayer: {
                columns: {},
                with: { user: { columns: { id: true, name: true, imageUrl: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: (match, { desc }) => [desc(match.createdAt)],
  });

  return match
    ? {
        id: match.id,
        homeTeam: {
          score: match.homeScore,
          expectedElo: match.homeExpectedElo,
          result: match.matchPlayers.find((p) => p.homeTeam)?.result as MatchResultSymbol,
          players: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => p.homeTeam) }),
        },
        awayTeam: {
          score: match.awayScore,
          expectedElo: match.awayExpectedElo,
          result: match.matchPlayers.find((p) => !p.homeTeam)?.result as MatchResultSymbol,
          players: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => !p.homeTeam) }),
        },
        seasonId: match.seasonId,
        createdAt: match.createdAt,
        createdBy: match.createdBy,
      }
    : undefined;
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

export const deleteMatch = async ({ matchId, userId }: { matchId: string; userId: string }) => {
  const match = await db.query.matches.findFirst({
    where: (match, { eq }) => eq(match.id, matchId),
    with: {
      matchPlayers: {
        columns: { id: true, eloBefore: true, homeTeam: true },
        with: {
          seasonPlayer: {
            columns: { id: true, elo: true, leaguePlayerId: true },
          },
        },
      },
      teamMatches: {
        columns: { id: true, eloBefore: true, seasonTeamId: true },
      },
      season: { columns: { id: true, leagueId: true } },
    },
  });
  if (!match) {
    throw new ScoreBrawlError({ code: "NOT_FOUND", message: "Match not found" });
  }
  // check read access
  await getLeagueById({
    userId,
    leagueId: match.season.leagueId,
  });

  const isLeaguePlayer = await db.query.leaguePlayers.findFirst({
    where: (lp, { and, eq }) =>
      and(eq(lp.leagueId, match.season.leagueId), eq(lp.userId, userId), eq(lp.disabled, false)),
  });

  if (!isLeaguePlayer) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "User not part of league",
    });
  }

  const lastMatch = await db.query.matches.findFirst({
    where: (m, { eq }) => eq(m.seasonId, match.seasonId),
    orderBy: desc(matches.createdAt),
  });

  if (lastMatch?.id !== match.id) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "Only the last match can be deleted",
    });
  }

  await db.transaction(async (tx) => {
    for (const matchPlayer of match.matchPlayers) {
      await tx
        .update(seasonPlayers)
        .set({ elo: matchPlayer.eloBefore })
        .where(eq(seasonPlayers.id, matchPlayer.seasonPlayer.id))
        .run();
    }
    for (const teamMatch of match.teamMatches) {
      await tx
        .update(seasonTeams)
        .set({ elo: teamMatch.eloBefore })
        .where(eq(seasonTeams.id, teamMatch.seasonTeamId))
        .run();
    }
    await tx.delete(matchPlayers).where(eq(matchPlayers.matchId, match.id)).run();
    await tx.delete(teamMatches).where(eq(teamMatches.matchId, match.id)).run();

    await tx.delete(matches).where(eq(matches.id, match.id)).run();
  });
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

const mapMatchTeam = ({
  matchPlayers,
}: {
  matchPlayers: {
    id: string;
    seasonPlayerId: string;
    seasonPlayer: {
      leaguePlayerId: string;
      elo: number;
      leaguePlayer: { user: { id: string; imageUrl: string; name: string } };
    };
  }[];
}) =>
  matchPlayers.map(
    (p): MatchPlayer => ({
      id: p.id,
      seasonPlayerId: p.seasonPlayerId,
      leaguePlayerId: p.seasonPlayer.leaguePlayerId,
      userId: p.seasonPlayer.leaguePlayer.user.id,
      name: p.seasonPlayer.leaguePlayer.user.name,
      elo: p.seasonPlayer.elo,
      imageUrl: p.seasonPlayer.leaguePlayer.user.imageUrl,
    }),
  );
