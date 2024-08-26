import { Avatar, AvatarFallback, AvatarImage } from "@scorebrawl/ui/avatar";
import { cn } from "@scorebrawl/ui/lib";
import { getInitialsFromString } from "@scorebrawl/utils/string";
import type { PlayerWithSelection } from "./MatchForm";

export const PlayerSelection = ({
  team,
  players,
  onSelect,
}: {
  team: "home" | "away";
  players: PlayerWithSelection[];
  onSelect: (player: PlayerWithSelection) => void;
}) => {
  const handlePlayerSelection = (player: PlayerWithSelection) => {
    onSelect({ ...player, team: player.team === team ? undefined : team });
  };

  return (
    <div className="flex flex-col gap-0.5">
      {players.map((p) => (
        <div
          key={p.user.userId}
          onClick={() => handlePlayerSelection(p)}
          onKeyDown={(e) => e.key === "Enter" && handlePlayerSelection(p)}
          role="button"
          tabIndex={0}
          className={cn(
            "flex gap-2 items-center p-1 rounded-md",
            p.team ? (p.team === team ? "bg-primary/20" : "line-through") : "",
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={p.user.imageUrl} />
            <AvatarFallback>{getInitialsFromString(p.user.name)}</AvatarFallback>
          </Avatar>
          <div className="grid auto-rows-min">
            <p className="text-xs font-medium truncate">{p.user.name}</p>
            <p className="text-xs text-muted-foreground">{p.score}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
