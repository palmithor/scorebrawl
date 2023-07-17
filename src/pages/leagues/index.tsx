import { type NextPage } from "next";
import { buttonVariants } from "~/components/ui/button";
import { api } from "~/lib/api";
import Link from "next/link";

const Leagues: NextPage = () => {
  const { data, isLoading } = api.league.getAll.useQuery({
    pageQuery: {},
  });

  return (
    <div className={"pb-8"}>
      <Link
        className={buttonVariants({ variant: "ghost" })}
        href="/leagues/create"
      >
        Create League
      </Link>

      {isLoading ? (
        <p>Is loading</p>
      ) : (
        <pre className="mt-2 rounded-md bg-slate-900 p-4">
          <code className={"text-white"}>{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  );
};

export default Leagues;
