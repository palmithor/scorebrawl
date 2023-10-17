import { useRouter } from "next/router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/api";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";

export const SeasonCard = (props: {
  season: {
    id: string;
    name: string;
    slug: string;
    initialElo: number;
    kFactor: number;
    startDate: Date;
    endDate: Date | null;
  };
}) => {
  const { id, name, startDate, endDate } = props.season;
  const leagueSlug = useLeagueSlug();
  const { data: stats } = api.season.getStats.useQuery({ seasonId: id });
  const { push } = useRouter();

  return (
    <Card
      className="cursor-pointer rounded-md bg-white shadow dark:bg-gray-800"
      onClick={() => void push(`/leagues/${leagueSlug}/seasons/${id}`)}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-l font-bold text-gray-800 dark:text-white">{name}</CardTitle>
        <CardDescription className="text-xs text-gray-500 dark:text-gray-300">
          {startDate.toDateString().substring(4)}
          {endDate && ` - ${endDate.toDateString().substring(4)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="border-t border-gray-200 p-6 dark:border-gray-700">
        <div className="space-y-3">
          <div className="flex items-center">
            <svg
              className=" mr-4 h-4 w-4 text-gray-500 dark:text-gray-300"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <p className="text-xs font-medium text-gray-800 dark:text-white">
              {stats?.matchCount} Matches
            </p>
          </div>
          <div className="flex items-center">
            <svg
              className=" mr-4 h-4 w-4 text-gray-500 dark:text-gray-300"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-xs font-medium text-gray-800 dark:text-white">
              {stats?.teamCount} Teams
            </p>
          </div>
          <div className="flex items-center">
            <svg
              className=" mr-4 h-4 w-4 text-gray-500 dark:text-gray-300"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p className="text-xs font-medium text-gray-800 dark:text-white">
              {stats?.playerCount} Players
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
