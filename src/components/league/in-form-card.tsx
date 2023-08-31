import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { AvatarName } from "../user/avatar-name";
import { FormDots } from "./form-dots";

export const InFormCard = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data, error, isLoading } = api.league.getBestForm.useQuery(
    {
      leagueSlug,
    },
    { retry: false }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">In form</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4 text-muted-foreground"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
          />
        </svg>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-row-reverse gap-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="mt-1 h-4 w-[200px]" />
            </div>
          </div>
        )}
        {error && !data && <div className="text-sm">No in form player available</div>}
        {data && (
          <div className="flex items-center ">
            <AvatarName name={data.name} avatarUrl={data.imageUrl}>
              <FormDots form={data.form} />
            </AvatarName>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
