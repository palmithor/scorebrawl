import { MatchPlayers, Matches, SeasonPlayers, Seasons, db } from "@/db";
import { CalculationStrategy, calculateTeamMatch } from "@ihs7/ts-elo";
import { and, asc, eq } from "drizzle-orm";
console.log("starting....");
if (!process.env.VERCEL) {
  console.error("prod not wowrking ");
  process.exit(1);
}

interface MatchPlayer {
  id: string;
  seasonPlayerId: string;
  homeTeam: boolean;
  matchId: string;
  scoreBefore: number;
  scoreAfter: number;
  result: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Match {
  id: string;
  seasonId: string;
  homeScore: number;
  awayScore: number;
  homeExpectedElo: number | null; // Allow null
  awayExpectedElo: number | null; // Allow null
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OriginalStructure {
  match: Match;
  match_player: MatchPlayer;
}

type TransformedStructure = Match & {
  teams: {
    home: MatchPlayer[];
    away: MatchPlayer[];
  };
};

function transformMatches(matches: OriginalStructure[]): TransformedStructure[] {
  const matchMap: { [key: string]: TransformedStructure } = {};

  for (const { match, match_player } of matches) {
    const matchId = match.id;

    if (!matchMap[matchId]) {
      // Initialize the match with empty home and away teams
      matchMap[matchId] = {
        ...match,
        teams: {
          home: [],
          away: [],
        },
      };
    }

    // Push the player to the respective team
    if (match_player.homeTeam) {
      matchMap[matchId].teams.home.push(match_player);
    } else {
      matchMap[matchId].teams.away.push(match_player);
    }
  }

  // Convert the map back to an array
  return Object.values(matchMap);
}

const seasonId = "";

const [season] = await db
  .select({
    initialScore: Seasons.initialScore,
    scoreType: Seasons.scoreType,
    kFactor: Seasons.kFactor,
  })
  .from(Seasons)
  .where(eq(Seasons.id, seasonId));
if (!season) {
  console.error("Season not found");
  process.exit(1);
}
const initialScore = season?.initialScore;

const matchesAndPlayers = await db
  .select()
  .from(Matches)
  .innerJoin(MatchPlayers, eq(Matches.id, MatchPlayers.matchId))
  .where(eq(Matches.seasonId, seasonId))
  .orderBy(asc(Matches.createdAt));

const seasonPlayers = (
  await db
    .select({ id: SeasonPlayers.id })
    .from(SeasonPlayers)
    .where(eq(SeasonPlayers.seasonId, seasonId))
).map((sp) => ({ seasonPlayerId: sp.id, score: initialScore }));

const transformedMatches = transformMatches(matchesAndPlayers);

for (const match of transformedMatches) {
  const homeTeam = {
    players: match.teams.home.map((p) => {
      const player = seasonPlayers.find((sp) => sp.seasonPlayerId === p.seasonPlayerId) as {
        seasonPlayerId: string;
        score: number;
      };
      return { id: player.seasonPlayerId, rating: player.score };
    }),
    score: match.homeScore,
  };
  const awayTeam = {
    players: match.teams.away.map((p) => {
      const player = seasonPlayers.find((sp) => sp.seasonPlayerId === p.seasonPlayerId) as {
        seasonPlayerId: string;
        score: number;
      };
      return { id: player.seasonPlayerId, rating: player.score };
    }),
    score: match.awayScore,
  };

  const eloMatchResult = calculateTeamMatch(homeTeam, awayTeam, {
    kFactor: season.kFactor,
    strategy:
      season.scoreType === "elo"
        ? CalculationStrategy.AVERAGE_TEAMS
        : CalculationStrategy.WEIGHTED_TEAMS,
  });

  for (const playerResult of eloMatchResult) {
    const player = seasonPlayers.find((sp) => sp.seasonPlayerId === playerResult.id) as {
      seasonPlayerId: string;
      score: number;
    };

    await db
      .update(MatchPlayers)
      .set({
        scoreBefore: player.score,
        scoreAfter: playerResult.newRating,
      })
      .where(
        and(
          eq(MatchPlayers.matchId, match.id),
          eq(MatchPlayers.seasonPlayerId, player.seasonPlayerId),
        ),
      );

    player.score = playerResult.newRating;
  }
}

for (const sp of seasonPlayers) {
  await db
    .update(SeasonPlayers)
    .set({ score: sp.score })
    .where(eq(SeasonPlayers.id, sp.seasonPlayerId));
}
process.exit(0);
