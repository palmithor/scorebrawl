import { MultiAvatar } from "~/components/user/multi-avatar";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";

type Match = inferRouterOutputs<AppRouter>["match"]["getAll"]["data"][0];
export const MatchResult = ({ match }: { match: Match }) => (
  <>
    <MultiAvatar users={match.homeTeam.players} visibleCount={3} />
    <div className="whitespace-nowrap text-2xl font-bold">
      {match.homeTeam.score} - {match.awayTeam.score}
    </div>
    <MultiAvatar users={match.awayTeam.players} visibleCount={3} />
  </>
);
