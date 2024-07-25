import { CalculationStrategy, Player, TeamMatch } from "@ihs7/ts-elo";
import type { Match, MatchInput, MatchResultSymbol } from "@scorebrawl/model";
import { type SQL, and, count, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import type z from "zod";
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
import { LeagueTeamRepository } from "./league-team-repository";

const create = async ({
  seasonId,
  homeTeamSeasonPlayerIds,
  awayTeamSeasonPlayerIds,
  homeScore,
  awayScore,
  userId,
}: z.infer<typeof MatchInput>) => {
  const [seasonById] = await db
    .select(getTableColumns(seasons))
    .from(seasons)
    .where(eq(seasons.id, seasonId));
  const season = seasonById as typeof seasons.$inferSelect;
  if (homeTeamSeasonPlayerIds.length !== awayTeamSeasonPlayerIds.length) {
    throw new ScoreBrawlError({
      code: "BAD_REQUEST",
      message: "Team sizes must be equal",
    });
  }

  const homeSeasonPlayers = await findAndValidateSeasonPlayers({
    seasonId,
    seasonPlayerIds: homeTeamSeasonPlayerIds,
  });
  const awaySeasonPlayers = await findAndValidateSeasonPlayers({
    seasonId,
    seasonPlayerIds: awayTeamSeasonPlayerIds,
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
      seasonId,
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

  return {
    id: match?.id ?? "",
    homeScore: homeScore,
    awayScore: awayScore,
    createdAt: now,
    homeTeamSeasonPlayerIds,
    awayTeamSeasonPlayerIds,
  } satisfies z.infer<typeof Match>;
};

const getBySeasonId = async ({
  seasonId,
  page = 1,
  limit = 30,
}: {
  seasonId: string;
  page?: number;
  limit?: number;
}) => {
  const [result, [countResult]] = await Promise.all([
    db.query.matches.findMany({
      where: (match, { eq }) => eq(match.seasonId, seasonId),
      with: {
        matchPlayers: {
          columns: { homeTeam: true, seasonPlayerId: true },
        },
      },
      offset: (page - 1) * limit,
      limit,
      orderBy: (match, { desc }) => [desc(match.createdAt)],
    }),
    db.select({ count: count() }).from(matches).where(eq(matches.seasonId, seasonId)),
  ]);

  return {
    matches: result.map(
      (match) =>
        ({
          id: match.id,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          createdAt: match.createdAt,
          homeTeamSeasonPlayerIds: match.matchPlayers
            .filter((p) => p.homeTeam)
            .map((p) => p.seasonPlayerId),
          awayTeamSeasonPlayerIds: match.matchPlayers
            .filter((p) => !p.homeTeam)
            .map((p) => p.seasonPlayerId),
        }) satisfies z.infer<typeof Match>,
    ),
    totalCount: countResult?.count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((countResult?.count ?? 0) / limit),
  };
};
const findLatest = async ({ seasonId }: { seasonId: string }) => {
  const match = await db.query.matches.findFirst({
    with: {
      matchPlayers: { columns: { seasonPlayerId: true, homeTeam: true } },
    },
    where: (match, { eq }) => eq(match.seasonId, seasonId),
    orderBy: desc(matches.createdAt),
  });

  return (
    match && {
      id: match.id,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      createdAt: match.createdAt,
      homeTeamSeasonPlayerIds: match.matchPlayers
        .filter((p) => p.homeTeam)
        .map((p) => p.seasonPlayerId),
      awayTeamSeasonPlayerIds: match.matchPlayers
        .filter((p) => !p.homeTeam)
        .map((p) => p.seasonPlayerId),
    }
  );
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
  seasonId,
}: {
  matchId: string;
  seasonId: string;
}) => {
  const [match] = await db
    .select({
      ...getTableColumns(matches),
      isLatest: sql`CASE WHEN ${matches.id} = ${db
        .select({ id: matches.id })
        .from(matches)
        .innerJoin(seasons, eq(seasons.id, matches.seasonId))
        .where(eq(matches.seasonId, seasonId))
        .orderBy(desc(matches.createdAt))
        .limit(1)} THEN true ELSE false END`.as("isLatest"),
    })
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.seasonId, seasonId)))
    .limit(1);
  if (!match) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "Match not found",
    });
  }
  if (!match.isLatest) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "Only the last match can be deleted",
    });
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

  sqlChunks.push(sql`(case`);
  for (const update of playerUpdateData) {
    sqlChunks.push(sql`when id = ${update.id} then ${update.score}`);
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
  season: typeof seasons.$inferSelect;
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

  throw new ScoreBrawlError({
    message: "Oh my lord!",
    code: "INTERNAL_SERVER_ERROR",
  });
};

const calculateElo = (
  season: typeof seasons.$inferSelect,
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

export const MatchRepository = {
  create,
  remove,
  getBySeasonId,
  findLatest,
};
