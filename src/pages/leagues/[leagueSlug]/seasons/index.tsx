import { type NextApiRequest, type NextApiResponse, type NextPage } from "next";
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const Seasons: NextPage = () => null;

export async function getServerSideProps({
  params,
  res,
  req,
}: {
  res: NextApiResponse;
  req: NextApiRequest;
  params: { leagueSlug: string };
}) {
  const ctx = createTRPCContext({ res, req });
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx,
    transformer: superjson,
  });
  const leagueSlug = params.leagueSlug;
  try {
    const ongoingSeason = await helpers.season.getOngoing.fetch({ leagueSlug });
    if (ongoingSeason) {
      return {
        redirect: {
          permanent: false,
          destination: `/leagues/${leagueSlug}/seasons/${ongoingSeason.id}`,
        },
      };
    }
  } catch (e) {
    // not found
  }
  const allSeasonsResult = await helpers.season.getAll.fetch({ leagueSlug });
  const seasons = allSeasonsResult.data ?? [];
  if (seasons[0]) {
    return {
      redirect: {
        permanent: false,
        destination: `/leagues/${leagueSlug}/seasons/${seasons[0].id}`,
      },
    };
  }

  return {
    redirect: {
      permanent: false,
      destination: `/leagues/${leagueSlug}/seasons/create`,
    },
  };
}
export default Seasons;
