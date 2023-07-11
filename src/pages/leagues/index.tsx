import { type GetServerSidePropsResult, type NextPage } from "next";
import { type NavbarTab } from "~/components/layout/navbar";
import { buttonVariants } from "~/components/ui/button";
import { api } from "~/lib/api";
import Link from "next/link";

const Leagues: NextPage = () => {
  const { data, isLoading, error } = api.league.getAll.useQuery({
    pageQuery: {},
  });
  return (
    <>
      <Link
        className={buttonVariants({ variant: "default" })}
        href="/leagues/create"
      >
        Create League
      </Link>

      {isLoading ? (
        <p>Is loading</p>
      ) : (
        <pre className="mt-2 rounded-md bg-slate-900 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </>
  );
};

export const getServerSideProps = (): GetServerSidePropsResult<{
  currentTab: NavbarTab;
}> => ({ props: { currentTab: "Leagues" } });

export default Leagues;
