"use client";
import { AvatarName } from "@/components/avatar-name";
import { AvatarWithLabel, type AvatarWithLabelProps } from "@/components/avatar-with-badge";
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
import type { LeagueAchievementType } from "@scorebrawl/api";
import { Medal } from "lucide-react";
import type { z } from "zod";

const bronze = "#CD7F32";
const silver = "#C0C0C0";
const gold = "#FFD700";
const getAchievementData = (
  type: z.output<typeof LeagueAchievementType>,
): Omit<AvatarWithLabelProps, "fallback"> & { title: string } => {
  switch (type) {
    case "5_win_streak":
      return {
        badgeBgColor: bronze,
        labelText: "5",
        title: "5 Win Streak",
        imageUrl: "/achievements/win-streak.jpeg",
      };
    case "10_win_streak":
      return {
        labelText: "10",
        badgeBgColor: silver,
        title: "10 Win Streak",
        imageUrl: "/achievements/win-streak.jpeg",
      };
    case "15_win_streak":
      return {
        labelText: "15",
        badgeBgColor: gold,
        title: "15 Win Streak",
        imageUrl: "/achievements/win-streak.jpeg",
      };
    case "3_win_loss_redemption":
      return {
        labelText: "3",
        badgeBgColor: silver,
        title: "3 Win Loss Redemption",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    case "5_win_loss_redemption":
      return {
        labelText: "5",
        badgeBgColor: gold,
        title: "5 Win Loss Redemption",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    case "5_clean_sheet_streak":
      return {
        labelText: "5",
        badgeBgColor: bronze,
        title: "5 Clean Sheet Streak",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    case "10_clean_sheet_streak":
      return {
        labelText: "10",
        badgeBgColor: silver,
        title: "10 Clean Sheet Streak",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    case "15_clean_sheet_streak":
      return {
        labelText: "15",
        badgeBgColor: gold,
        title: "15 Clean Sheet Streak",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    case "3_goals_5_games":
      return {
        labelText: "3",
        badgeBgColor: bronze,
        title: "3 Goals 5 Games",
        imageUrl: "/achievements/goal-scoring-streak.jpeg",
      };
    case "5_goals_5_games":
      return {
        labelText: "5",
        badgeBgColor: silver,
        title: "5 Goals 5 Games",
        imageUrl: "/achievements/goal-scoring-streak.jpeg",
      };
    case "8_goals_5_games":
      return {
        labelText: "8",
        badgeBgColor: gold,
        title: "8 Goals 5 Games",
        imageUrl: "/achievements/goal-scoring-streak.jpeg",
      };
    case "season_winner":
      return {
        labelText: "🏆",
        badgeBgColor: gold,
        title: "Season Winner",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    default:
      return { labelText: "", title: "Unknown", imageUrl: "/achievements/clean-sheet-streak.jpeg" };
  }
};

const AchievementsCell = ({
  leagueSlug,
  leaguePlayerId,
}: { leagueSlug: string; leaguePlayerId: string }) => {
  const { data } = api.achievement.getUserAchievements.useQuery({ leagueSlug, leaguePlayerId });
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {data.map((achievement) => {
        const achievementData = getAchievementData(achievement.type);
        return (
          <Tooltip key={achievement.id}>
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
              <AvatarName
                avatarClassName="h-8 w-8"
                name={player.user.name}
                imageUrl={player.user.imageUrl || ""}
              />
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
