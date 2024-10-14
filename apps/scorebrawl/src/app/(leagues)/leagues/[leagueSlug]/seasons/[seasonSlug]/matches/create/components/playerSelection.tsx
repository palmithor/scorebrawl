import { cn } from "@/lib/utils";
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
        <input
          key={p.user.userId}
          onClick={() => handlePlayerSelection(p)}
          onKeyDown={(e) => e.key === "Enter" && handlePlayerSelection(p)}
          type="button"
          tabIndex={0}
          className={cn(
            "flex gap-2 items-center p-1 rounded-md",
            p.team ? (p.team === team ? "bg-primary/20" : "line-through") : "",
          )}
        />
      ))}
    </div>
  );
};
