import { MatchResult } from "@scorebrawl/api";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import { Card, CardContent, CardHeader, CardTitle } from "@scorebrawl/ui/card";
import { FormDots } from "../player-form";

import { Flame, Snowflake } from "lucide-react";

export const PlayerFormCard = ({
  state,
  player,
}: {
  player?: { name: string; imageUrl: string; matches: { result: MatchResult }[] };
  state: "top" | "bottom";
}) => {
  const title = state === "top" ? "On Fire" : "Ice Cold";
  const StateIcon = state === "top" ? Flame : Snowflake;
  const form = player?.matches.map((match) => match.result) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <StateIcon className="h-6 w-6" />
      </CardHeader>
      <CardContent>
        {!player && <div className="text-sm">No games played in current season</div>}
        {player && (
          <div className="flex items-center ">
            <AvatarName name={player.name} avatarUrl={player.imageUrl}>
              <FormDots form={form} />
            </AvatarName>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
