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

const getAchievementData = (
  type: z.output<typeof LeagueAchievementType>,
): Omit<AvatarWithLabelProps, "fallback"> & { title: string } => {
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
        imageUrl: "/achievements/win-streak.jpeg",
      };
    }
    case "3_win_loss_redemption":
    case "5_win_loss_redemption": {
      let labelText = "🥈";
      let title = "3 win streak after 3 losses";
      if (type === "5_win_loss_redemption") {
        labelText = "🥇";
        title = "5 win streak after 5 losses";
      }
      return {
        labelText,
        title,
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
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
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    }
    case "season_winner":
      return {
        labelText: "🏆",
        title: "Season Winner",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
    default:
      return {
        labelText: "💩",
        title: "Unknown",
        imageUrl: "/achievements/clean-sheet-streak.jpeg",
      };
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
