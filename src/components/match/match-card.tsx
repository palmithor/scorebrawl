/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type inferRouterOutputs } from "@trpc/server";
import { type ReactNode } from "react";
import { type AppRouter } from "~/server/api/root";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MultiAvatar } from "../user/multi-avatar";

export const MatchCard = ({
  title,
  icon,
  match,
}: {
  title: string;
  match: inferRouterOutputs<AppRouter>["match"]["getLatest"];
  icon?: ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-4">
        <MultiAvatar users={match.homeTeam.players} visibleCount={3} />
        <div className="text-2xl font-bold">
          {match.homeTeam.score} - {match.awayTeam.score}
        </div>
        <MultiAvatar users={match.awayTeam.players} visibleCount={3} />
      </div>
      <p className="text-xs text-muted-foreground">
        In season <b>{match.season.name}</b>
      </p>
    </CardContent>
  </Card>
);
