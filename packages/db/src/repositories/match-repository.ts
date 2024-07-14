import { CalculationStrategy, Player, TeamMatch } from "@ihs7/ts-elo";
import type { CreateMatchInput, MatchResultSymbol, PageRequest } from "@scorebrawl/api";
import { type SQL, and, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { LeagueRepository, SeasonRepository } from ".";
import {
  ScoreBrawlError,
  createCuid,
  db,
  leaguePlayers,
  leagues,
  matchPlayers,
  matches,
  seasonPlayers,
  seasonTeams,
  seasons,
  teamMatches,
  users,
} from "..";
import type { Match, MatchPlayer, Season } from "../types";
import { LeagueTeamRepository } from "./league-team-repository";

const create = async ({
  leagueId,
  seasonId,
  homePlayerIds,
  awayPlayerIds,
  homeScore,
  awayScore,
  userId,
}: CreateMatchInput & { leagueId: string }) => {
  const season = await SeasonRepository.getById({
    leagueId,
    seasonId,
    userId,
  });

  const league = await LeagueRepository.getByIdWhereMember({
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

  const individualMatchResult = calculateMatchResult({
    season,
    homeScore: homeScore,
    awayScore: awayScore,
    homePlayers: homeSeasonPlayers,
    awayPlayers: awaySeasonPlayers,
  });

  const [match] = await db
    .insert(matches)
    .values({
      id: createCuid(),
      homeScore: homeScore,
      awayScore: awayScore,
      homeExpectedElo: individualMatchResult.homeTeam.winningOdds,
      awayExpectedElo: individualMatchResult.awayTeam.winningOdds,
      seasonId: season.id,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  let homeTeamResult: MatchResultSymbol = "D";
  let awayTeamResult: MatchResultSymbol = "D";
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
      matchId: match?.id ?? "",
      scoreBefore: player.score,
      eloBefore: player.score,
      eloAfter: individualMatchResult.awayTeam.players.find((p) => p.id === player.id)
        ?.scoreAfter as number,
      scoreAfter: individualMatchResult.awayTeam.players.find((p) => p.id === player.id)
        ?.scoreAfter as number,
      seasonPlayerId: player.id,
      homeTeam: false,
      result: awayTeamResult,
      createdAt: now,
      updatedAt: now,
    })),
    ...homeSeasonPlayers.map((player) => ({
      id: createCuid(),
      matchId: match?.id ?? "",
      eloBefore: player.score,
      scoreBefore: player.score,
      eloAfter: individualMatchResult.homeTeam.players.find((p) => p.id === player.id)
        ?.scoreAfter as number,
      scoreAfter: individualMatchResult.homeTeam.players.find((p) => p.id === player.id)
        ?.scoreAfter as number,
      seasonPlayerId: player.id,
      homeTeam: true,
      result: homeTeamResult,
      createdAt: now,
      updatedAt: now,
    })),
  ];
  await db.insert(matchPlayers).values(matchPlayerValues);

  for (const playerResult of [
    ...individualMatchResult.homeTeam.players,
    ...individualMatchResult.awayTeam.players,
  ]) {
    await db
      .update(seasonPlayers)
      .set({ score: playerResult.scoreAfter })
      .where(eq(seasonPlayers.id, playerResult.id));
  }

  if (homeSeasonPlayers.length > 1 && awaySeasonPlayers.length > 1) {
    const { seasonTeamId: homeSeasonTeamId, score: homeSeasonTeamScore } =
      await LeagueTeamRepository.getOrInsertTeam({
        season,
        now,
        players: homeSeasonPlayers,
      });
    const { seasonTeamId: awaySeasonTeamId, score: awaySeasonTeamScore } =
      await LeagueTeamRepository.getOrInsertTeam({
        season,
        now,
        players: awaySeasonPlayers,
      });

    const teamMatchResult = calculateMatchResult({
      season,
      homeScore: homeScore,
      awayScore: awayScore,
      homePlayers: [{ id: homeSeasonTeamId, score: homeSeasonTeamScore }],
      awayPlayers: [{ id: awaySeasonTeamId, score: awaySeasonTeamScore }],
    });

    await db.insert(teamMatches).values([
      {
        id: createCuid(),
        matchId: match?.id ?? "",
        seasonTeamId: homeSeasonTeamId,
        scoreBefore: homeSeasonTeamScore,
        scoreAfter: teamMatchResult.homeTeam.players.find((r) => r.id === homeSeasonTeamId)
          ?.scoreAfter as number,
        result: homeTeamResult,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: createCuid(),
        matchId: match?.id ?? "",
        seasonTeamId: awaySeasonTeamId,
        scoreBefore: awaySeasonTeamScore,
        scoreAfter: teamMatchResult.awayTeam.players.find((r) => r.id === awaySeasonTeamId)
          ?.scoreAfter as number,
        result: awayTeamResult,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    for (const teamResult of [
      ...teamMatchResult.homeTeam.players,
      ...teamMatchResult.awayTeam.players,
    ]) {
      await db
        .update(seasonTeams)
        .set({ score: teamResult.scoreAfter })
        .where(eq(seasonTeams.id, teamResult.id));
    }
  }

  return match;
};

const getBySeasonId = async ({
  leagueId,
  seasonId,
  userId,
  limit = 10,
  page = 1,
}: { leagueId: string; seasonId: string; userId: string } & PageRequest): Promise<{
  data: Match[];
}> => {
  const season = await SeasonRepository.getById({
    leagueId,
    seasonId,
    userId,
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
            columns: { id: true, score: true, leaguePlayerId: true },
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
      homeScore: match.homeScore,
      homeTeam: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => p.homeTeam) }),
      awayScore: match.awayScore,
      awayTeam: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => !p.homeTeam) }),
      seasonId: match.seasonId,
      createdAt: match.createdAt,
      createdBy: match.createdBy,
    })),
  };
};

const findLatest = async ({ leagueId, seasonSlug }: { leagueId: string; seasonSlug: string }) => {
  const [match] = await db
    .select({
      id: matches.id,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      seasonId: matches.seasonId,
      createdAt: matches.createdAt,
    })
    .from(matches)
    .innerJoin(
      seasons,
      and(
        eq(seasons.leagueId, leagueId),
        eq(seasons.id, matches.seasonId),
        eq(seasons.slug, seasonSlug),
      ),
    )
    .limit(1)
    .orderBy(desc(matches.createdAt));
  if (match) {
    const players = await db
      .select({
        homeTeam: matchPlayers.homeTeam,
        userId: users.id,
        name: users.name,
        imageUrl: users.imageUrl,
      })
      .from(matchPlayers)
      .innerJoin(seasonPlayers, eq(matchPlayers.seasonPlayerId, seasonPlayers.id))
      .innerJoin(leaguePlayers, eq(seasonPlayers.leaguePlayerId, leaguePlayers.id))
      .innerJoin(users, eq(leaguePlayers.userId, users.id))
      .where(eq(matchPlayers.matchId, match.id));
    return {
      ...match,
      homeTeam: players.filter((p) => p.homeTeam),
      awayTeam: players.filter((p) => !p.homeTeam),
    };
  }
  return undefined;
};

const getLatestMatchDepr = async ({
  leagueId,
  userId,
}: { leagueId: string; userId: string }): Promise<Match | undefined> => {
  const league = await LeagueRepository.getLeagueById({ leagueId, userId });

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
            columns: { id: true, score: true, leaguePlayerId: true },
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
        homeScore: match.homeScore,
        homeTeam: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => p.homeTeam) }),
        awayScore: match.awayScore,
        awayTeam: mapMatchTeam({ matchPlayers: match.matchPlayers.filter((p) => !p.homeTeam) }),
        seasonId: match.seasonId,
        createdAt: match.createdAt,
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

const remove = async ({
  matchId,
  seasonSlug,
  leagueSlug,
}: { matchId: string; seasonSlug: string; leagueSlug: string }) => {
  const [match] = await db
    .select({
      ...getTableColumns(matches),
      isLatest: sql`CASE WHEN ${matches.id} = ${db
        .select({ id: matches.id })
        .from(matches)
        .innerJoin(seasons, and(eq(seasons.id, matches.seasonId), eq(seasons.slug, seasonSlug)))
        .orderBy(desc(matches.createdAt))
        .limit(1)} THEN true ELSE false END`.as("isLatest"),
    })
    .from(matches)
    .innerJoin(seasons, and(eq(seasons.id, matches.seasonId), eq(seasons.slug, seasonSlug)))
    .innerJoin(leagues, and(eq(leagues.id, seasons.leagueId), eq(leagues.slug, leagueSlug)))
    .where(eq(matches.id, matchId))
    .limit(1);
  if (!match) {
    throw new ScoreBrawlError({ code: "NOT_FOUND", message: "Match not found" });
  }
  if (!match.isLatest) {
    throw new ScoreBrawlError({ code: "FORBIDDEN", message: "Only the last match can be deleted" });
  }

  await revertScores({ matchId });
  await db.delete(matchPlayers).where(eq(matchPlayers.matchId, match.id));
  await db.delete(teamMatches).where(eq(teamMatches.matchId, match.id));
  await db.delete(matches).where(eq(matches.id, match.id));
};

const revertScores = async ({ matchId }: { matchId: string }) => {
  const players = await db.select().from(matchPlayers).where(eq(matchPlayers.matchId, matchId));
  const playerUpdateData = players.map((mp) => ({
    id: mp.seasonPlayerId,
    score: mp.scoreBefore,
  }));
  const sqlChunks: SQL[] = [];
  const ids: string[] = [];

  sqlChunks.push(sql`(case`);
  for (const update of playerUpdateData) {
    sqlChunks.push(sql`when id = ${update.id} then ${update.score}`);
    ids.push(update.id);
  }
  sqlChunks.push(sql`end)`);
  const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

  db.update(seasonPlayers)
    .set({ score: finalSql })
    .where(
      inArray(
        seasonPlayers.id,
        playerUpdateData.map((sp) => sp.id),
      ),
    );
};

const removeDepr = async ({ matchId, userId }: { matchId: string; userId: string }) => {
  const match = await db.query.matches.findFirst({
    where: (match, { eq }) => eq(match.id, matchId),
    with: {
      matchPlayers: {
        columns: { id: true, scoreBefore: true, homeTeam: true },
        with: {
          seasonPlayer: {
            columns: { id: true, score: true, leaguePlayerId: true },
          },
        },
      },
      teamMatches: {
        columns: { id: true, scoreBefore: true, seasonTeamId: true },
      },
      season: { columns: { id: true, leagueId: true } },
    },
  });
  if (!match) {
    throw new ScoreBrawlError({ code: "NOT_FOUND", message: "Match not found" });
  }
  // check read access
  await LeagueRepository.getLeagueById({
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

  for (const matchPlayer of match.matchPlayers) {
    await db
      .update(seasonPlayers)
      .set({ score: matchPlayer.scoreBefore })
      .where(eq(seasonPlayers.id, matchPlayer.seasonPlayer.id));
  }
  for (const teamMatch of match.teamMatches) {
    await db
      .update(seasonTeams)
      .set({ score: teamMatch.scoreBefore })
      .where(eq(seasonTeams.id, teamMatch.seasonTeamId));
  }
  await db.delete(matchPlayers).where(eq(matchPlayers.matchId, match.id));
  await db.delete(teamMatches).where(eq(teamMatches.matchId, match.id));
  await db.delete(matches).where(eq(matches.id, match.id));
};

type CalculateMatchTeamResult = {
  winningOdds: number;
  players: { id: string; scoreAfter: number }[];
};

const calculateMatchResult = ({
  season,
  homeScore,
  awayScore,
  homePlayers,
  awayPlayers,
}: {
  season: Season;
  homeScore: number;
  awayScore: number;
  homePlayers: { id: string; score: number }[];
  awayPlayers: { id: string; score: number }[];
}): {
  homeTeam: CalculateMatchTeamResult;
  awayTeam: CalculateMatchTeamResult;
} => {
  if (season.scoreType === "elo" || season.scoreType === "elo-individual-vs-team") {
    return calculateElo(season, homeScore, homePlayers, awayScore, awayPlayers);
  }

  if (season.scoreType === "3-1-0") {
    return calculate310(homePlayers, homeScore, awayScore, awayPlayers);
  }

  throw new ScoreBrawlError({ message: "Oh my lord!", code: "INTERNAL_SERVER_ERROR" });
};

const calculateElo = (
  season: Season,
  homeScore: number,
  homePlayers: {
    id: string;
    score: number;
  }[],
  awayScore: number,
  awayPlayers: { id: string; score: number }[],
) => {
  const eloIndividualMatch = new TeamMatch({
    kFactor: season.kFactor,
    calculationStrategy:
      season.scoreType === "elo"
        ? CalculationStrategy.TEAM_VS_TEAM
        : CalculationStrategy.INDIVIDUAL_VS_TEAM,
  });
  const eloHomeTeam = eloIndividualMatch.addTeam("home", homeScore);
  for (const p of homePlayers) {
    eloHomeTeam.addPlayer(new Player(p.id, p.score));
  }
  const eloAwayTeam = eloIndividualMatch.addTeam("away", awayScore);
  for (const p of awayPlayers) {
    eloAwayTeam.addPlayer(new Player(p.id, p.score));
  }
  const eloMatchResult = eloIndividualMatch.calculate();
  return {
    homeTeam: {
      winningOdds: eloHomeTeam.expectedScoreAgainst(eloAwayTeam),
      players: eloHomeTeam.players.map((p) => ({
        id: p.identifier,
        scoreAfter: eloMatchResult.results.find((r) => r.identifier === p.identifier)
          ?.rating as number,
      })),
    },
    awayTeam: {
      winningOdds: eloAwayTeam.expectedScoreAgainst(eloHomeTeam),
      players: eloAwayTeam.players.map((p) => ({
        id: p.identifier,
        scoreAfter: eloMatchResult.results.find((r) => r.identifier === p.identifier)
          ?.rating as number,
      })),
    },
  };
};

const calculate310 = (
  homePlayers: { id: string; score: number }[],
  homeScore: number,
  awayScore: number,
  awayPlayers: {
    id: string;
    score: number;
  }[],
) => ({
  homeTeam: {
    winningOdds: 0.5,
    players: homePlayers.map((p) => ({
      id: p.id,
      scoreAfter: p.score + (homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0),
    })),
  },
  awayTeam: {
    winningOdds: 0.5,
    players: awayPlayers.map((p) => ({
      id: p.id,
      scoreAfter: p.score + (awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0),
    })),
  },
});

const mapMatchTeam = ({
  matchPlayers,
}: {
  matchPlayers: {
    id: string;
    seasonPlayerId: string;
    seasonPlayer: {
      leaguePlayerId: string;
      score: number;
      leaguePlayer: { user: { id: string; imageUrl: string; name: string } };
    };
  }[];
}) =>
  matchPlayers.map(
    (p): MatchPlayer => ({
      userId: p.seasonPlayer.leaguePlayer.user.id,
      name: p.seasonPlayer.leaguePlayer.user.name,
      imageUrl: p.seasonPlayer.leaguePlayer.user.imageUrl,
    }),
  );

export const MatchRepository = {
  create,
  remove,
  removeDepr,
  getLatestMatchDepr,
  findLatest,
  getBySeasonId,
};
