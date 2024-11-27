"use client";
import { AvatarName } from "@/components/avatar/avatar-name";
import { AvatarWithLabel, type AvatarWithLabelProps } from "@/components/avatar/avatar-with-badge";
import { DateCell } from "@/components/date-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { LeagueAchievementType } from "@scorebrawl/api"; // Removed 'typeof'
import { Medal } from "lucide-react";
import type { z } from "zod";

// Utility function to extract the numeric part of the achievement type
const getNumericValue = (achievement: string): number | null => {
  const match = achievement.match(/^\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
};

// Define the groups of achievements
const achievementGroups: { [key: string]: z.output<typeof LeagueAchievementType>[] } = {
  win_streak: ["5_win_streak", "10_win_streak", "15_win_streak"],
  win_loss_redemption: ["3_win_loss_redemption", "5_win_loss_redemption", "8_win_loss_redemption"],
  clean_sheet_streak: ["5_clean_sheet_streak", "10_clean_sheet_streak", "15_clean_sheet_streak"],
  goals_5_games: ["3_goals_5_games", "5_goals_5_games", "8_goals_5_games"],
  season_winner: ["season_winner"],
};

// Function to get the top achievement per group
const getTopAchievements = (
  achievements: z.output<typeof LeagueAchievementType>[],
): z.output<typeof LeagueAchievementType>[] => {
  const topAchievements: z.output<typeof LeagueAchievementType>[] = [];

  // Iterate over each group and find the top achievement in that group
  for (const [_, types] of Object.entries(achievementGroups)) {
    const groupAchievements = achievements.filter((a) => types.includes(a));

    if (groupAchievements.length > 0) {
      const topAchievement = groupAchievements.sort((a, b) => {
        const aValue = getNumericValue(a) ?? 0;
        const bValue = getNumericValue(b) ?? 0;
        return bValue - aValue; // Sort descending
      })[0];

      // @ts-ignore
      topAchievements.push(topAchievement);
    }
  }

  return topAchievements;
};

// Function to map achievement type to display properties
const getAchievementData = (
  type: z.output<typeof LeagueAchievementType>, // Corrected type usage
): Omit<AvatarWithLabelProps, "fallback"> & {
  title: string;
  type: z.output<typeof LeagueAchievementType>; // Corrected type usage
} => {
  switch (type) {
    case "5_win_streak":
    case "10_win_streak":
    case "15_win_streak": {
      let labelText = "🥉";
      let title = "5 Win Streak";
      if (type === "10_win_streak") {
        labelText = "🥈";
        title = "10 Win Streak";
      } else if (type === "15_win_streak") {
        labelText = "🥇";
        title = "15 Win Streak";
      }
      return {
        labelText,
        title,
        image: "/achievements/win-streak-v2.jpeg",
        type,
      };
    }
    case "3_win_loss_redemption":
    case "5_win_loss_redemption":
    case "8_win_loss_redemption": {
      let labelText = "🥉";
      let title = "3 win streak after 3 losses";
      if (type === "5_win_loss_redemption") {
        labelText = "🥈";
        title = "5 win streak after 5 losses";
      } else if (type === "8_win_loss_redemption") {
        labelText = "🥇";
        title = "8 win streak after 8 losses";
      }
      return {
        labelText,
        title,
        image: "/achievements/redemption.jpeg",
        type,
      };
    }
    case "5_clean_sheet_streak":
    case "10_clean_sheet_streak":
    case "15_clean_sheet_streak": {
      let labelText = "🥉";
      let title = "5 Clean Sheet Streak";
      if (type === "10_clean_sheet_streak") {
        labelText = "🥈";
        title = "10 Clean Sheet Streak";
      } else if (type === "15_clean_sheet_streak") {
        labelText = "🥇";
        title = "15 Clean Sheet Streak";
      }
      return {
        labelText,
        title,
        image: "/achievements/clean-sheet-v2.jpeg",
        type,
      };
    }
    case "3_goals_5_games":
    case "5_goals_5_games":
    case "8_goals_5_games": {
      let labelText = "🥉";
      let title = "3 Goals 5 in a row";
      if (type === "5_goals_5_games") {
        labelText = "🥈";
        title = "5 Goals 5 in a row";
      } else if (type === "8_goals_5_games") {
        labelText = "🥇";
        title = "8 Goals 5 in a row";
      }
      return {
        labelText,
        title,
        image: "/achievements/goal-scoring-streak-v2.jpeg",
        type,
      };
    }
    case "season_winner":
      return {
        labelText: "🏆",
        title: "Season Winner",
        image: "/achievements/clean-sheet-streak.jpeg",
        type,
      };
    default:
      return {
        labelText: "💩",
        title: "Unknown",
        image: "/achievements/clean-sheet-streak.jpeg",
        type,
      };
  }
};

// Updated AchievementsCell to only display top achievements
const AchievementsCell = ({
  leagueSlug,
  leaguePlayerId,
}: { leagueSlug: string; leaguePlayerId: string }) => {
  const { data } = api.achievement.getUserAchievements.useQuery({ leagueSlug, leaguePlayerId });
  if (!data || data.length === 0) {
    return null;
  }

  // Filter the achievements to only get the top one per group
  const topAchievements = getTopAchievements(data.map((achievement) => achievement.type));

  return (
    <div className="flex gap-2">
      {topAchievements.map((achievementType) => {
        const achievementData = getAchievementData(achievementType);
        return (
          <Tooltip key={achievementData.type}>
            <TooltipTrigger>
              <AvatarWithLabel
                size={"sm"}
                {...achievementData}
                fallback={<Medal className="mr-1 h-2 w-2" />}
              />
            </TooltipTrigger>

            <TooltipContent side="bottom">
              <p>{achievementData.title}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export const LeaguePlayersTable = ({
  leagueSlug,
}: {
  leagueSlug: string;
}) => {
  const { data } = api.leaguePlayer.getAll.useQuery({ leagueSlug });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Achievements</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((player) => (
          <TableRow key={player.leaguePlayerId}>
            <TableCell>
              <AvatarName name={player.user.name} image={player.user.image} />
            </TableCell>
            <TableCell>
              <DateCell date={player.joinedAt} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2 items-center">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    player.disabled ? "bg-rose-900" : "bg-green-400",
                  )}
                />
                <div>{player.disabled ? "Inactive" : "Active"}</div>
              </div>
            </TableCell>
            <TableCell>
              <AchievementsCell leagueSlug={leagueSlug} leaguePlayerId={player.leaguePlayerId} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
