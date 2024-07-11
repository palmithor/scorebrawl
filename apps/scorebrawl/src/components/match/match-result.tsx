import type { Match } from "@scorebrawl/db/types";
import { MultiAvatar } from "@scorebrawl/ui/multi-avatar";

export const MatchResult = ({ match }: { match: Match }) => (
  <>
    <MultiAvatar users={match.homeTeam.map((p) => ({ ...p, id: p.userId }))} visibleCount={3} />
    <div className="whitespace-nowrap text-2xl font-bold">
      {match.homeScore} - {match.awayScore}
    </div>
    <MultiAvatar users={match.awayTeam.map((p) => ({ ...p, id: p.userId }))} visibleCount={3} />
  </>
);
