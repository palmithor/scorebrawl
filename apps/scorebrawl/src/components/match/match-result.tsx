import { Match } from "@scorebrawl/db/types";
import { MultiAvatar } from "@scorebrawl/ui/multi-avatar";

export const MatchResult = ({ match }: { match: Match }) => (
  <>
    <MultiAvatar
      users={match.homeTeam.players.map((p) => ({ ...p, id: p.userId }))}
      visibleCount={3}
    />
    <div className="whitespace-nowrap text-2xl font-bold">
      {match.homeTeam.score} - {match.awayTeam.score}
    </div>
    <MultiAvatar
      users={match.awayTeam.players.map((p) => ({ ...p, id: p.userId }))}
      visibleCount={3}
    />
  </>
);
