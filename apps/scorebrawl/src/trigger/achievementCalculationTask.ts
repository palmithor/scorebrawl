import { LeaguePlayerRepository, SeasonPlayerRepository } from "@scorebrawl/db";
import { createAchievement } from "@scorebrawl/db/achievement";
import { createNotification } from "@scorebrawl/db/notification";
import type {
  LeagueAchievementType,
  leagueAchievementType,
} from "@scorebrawl/model";
import { task } from "@trigger.dev/sdk/v3";
import type { z } from "zod";

type AchievementCalculationTaskInput = {
  seasonPlayerIds: string[];
};

type MatchLeagueAchievement = (typeof leagueAchievementType)[number];

type PartialRecord<K extends string | number | symbol, T> = {
  [P in K]?: T;
};

const achievements: PartialRecord<MatchLeagueAchievement, number> = {
  "5_win_streak": 5,
  "10_win_streak": 10,
  "15_win_streak": 15,

  //"3_win_loss_redemption": 3,
  //"5_win_loss_redemption": 5,

  "5_clean_sheet_streak": 5,
  "10_clean_sheet_streak": 10,
  "15_clean_sheet_streak": 15,

  "3_goals_5_games": 3,
  "5_goals_5_games": 5,
  "8_goals_5_games": 8,
};

export const achievementCalculationTask = task({
  id: "achivement-calculations",
  run: async (
    { seasonPlayerIds }: AchievementCalculationTaskInput /*{ctx}*/
  ) => {
    const playerAchievements: Record<
      string,
      z.output<typeof LeagueAchievementType>[]
    > = {};

    for (const seasonPlayerId of seasonPlayerIds) {
      playerAchievements[seasonPlayerId] = [];
      const seasonPlayerMatches = await SeasonPlayerRepository.getPlayerMatches(
        { seasonPlayerId }
      );

      const lastFiveMatchesGoals =
        await SeasonPlayerRepository.getLastFiveMatchesGoals(seasonPlayerId);
      checkGoalsScoredStreak(
        playerAchievements[seasonPlayerId],
        lastFiveMatchesGoals
      );

      let currentWinStreak = 0;
      let currentCleanSheetStreak = 0;
      let maxLossStreak = 0;
      let currentLossStreak = 0;

      const goalsConcededAgainst =
        await SeasonPlayerRepository.getGoalsConcededAgainst({
          seasonPlayerId,
          matchIds: seasonPlayerMatches.map((m) => m.matchId),
        });

      const matches = seasonPlayerMatches.map((match) => {
        const goalsFromMatch = goalsConcededAgainst.find(
          (mg) => mg.matchId === match.matchId
        );
        return { ...match, ...goalsFromMatch };
      });
      for (const match of matches) {
        // Update win/loss streaks
        if (match.result === "W") {
          currentWinStreak++;
          currentLossStreak = 0;
        } else if (match.result === "L") {
          currentLossStreak++;
          currentWinStreak = 0;
          maxLossStreak =
            currentLossStreak > maxLossStreak
              ? currentLossStreak
              : maxLossStreak;
        } else {
          currentWinStreak = 0;
          currentLossStreak = 0;
        }

        // Check for win streaks
        checkStreakAchievement(
          playerAchievements[seasonPlayerId],
          currentWinStreak,
          ["5_win_streak", "10_win_streak", "15_win_streak"]
        );

        // Check for redemptions
        checkRedemptionAchievement(
          playerAchievements[seasonPlayerId],
          maxLossStreak,
          currentWinStreak,
          ["3_win_loss_redemption", "5_win_loss_redemption"]
        );

        // Update and check clean sheet streak
        if (match.goalsConceded === 0) {
          currentCleanSheetStreak++;
          checkStreakAchievement(
            playerAchievements[seasonPlayerId],
            currentCleanSheetStreak,
            [
              "5_clean_sheet_streak",
              "10_clean_sheet_streak",
              "15_clean_sheet_streak",
            ]
          );
        } else {
          currentCleanSheetStreak = 0;
        }
      }
    }
    const playerIds = await LeaguePlayerRepository.findLeaguePlayerIds(
      Object.keys(playerAchievements)
    );
    for (const seasonPlayerId of Object.keys(playerAchievements)) {
      const player = playerIds.find((p) => p.seasonPlayerId === seasonPlayerId);
      if (player && playerAchievements[seasonPlayerId]) {
        for (const achievement of playerAchievements[seasonPlayerId]) {
          await createAchievement({
            leaguePlayerId: player.leaguePlayerId,
            type: achievement,
          });
          await createNotification({
            userId: player.userId,
            type: "achievement",
            data: { leagueAchievementType: achievement },
          });
        }
      }
    }
    return playerAchievements;
  },
});

const checkGoalsScoredStreak = (
  playerAchievements: z.output<typeof LeagueAchievementType>[],
  lastFiveMatchesGoals: number[]
) => {
  if (lastFiveMatchesGoals.length > 4) {
    if (lastFiveMatchesGoals.every((n) => n >= 8)) {
      playerAchievements.push("8_goals_5_games");
      playerAchievements.push("5_goals_5_games");
      playerAchievements.push("3_goals_5_games");
    } else if (lastFiveMatchesGoals.every((n) => n >= 5)) {
      playerAchievements.push("5_goals_5_games");
      playerAchievements.push("3_goals_5_games");
    } else if (lastFiveMatchesGoals.every((n) => n >= 3)) {
      playerAchievements.push("3_goals_5_games");
    }
  }
};

const checkStreakAchievement = (
  playerAchievements: z.output<typeof LeagueAchievementType>[],
  currentStreak: number,
  streakAchievements: z.output<typeof LeagueAchievementType>[]
): void => {
  for (const achievement of streakAchievements) {
    if (
      currentStreak === achievements[achievement] &&
      !playerAchievements.includes(achievement)
    ) {
      playerAchievements.push(achievement);
    }
  }
};

const checkRedemptionAchievement = (
  playerAchievements: z.output<typeof LeagueAchievementType>[],
  maxLossStreak: number,
  currentWinStreak: number,
  redemptionAchievements: z.output<typeof LeagueAchievementType>[]
): void => {
  for (const achievement of redemptionAchievements) {
    const requiredStreak = achievements[achievement];
    if (
      requiredStreak &&
      maxLossStreak >= requiredStreak &&
      currentWinStreak === requiredStreak &&
      !playerAchievements.includes(achievement)
    ) {
      playerAchievements.push(achievement);
    }
  }
};
