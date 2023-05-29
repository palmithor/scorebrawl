import { type NextPage } from "next";
import { api } from "~/lib/api";
import { Button } from "~/components/ui/button";

const Dashboard: NextPage = () => {
  const { mutate: createLeagueMutate, data: newlyCreatedLeague } =
    api.league.create.useMutation();
  const { mutate: createSeasonMutate } = api.season.create.useMutation();
  const { data: code } = api.league.getCode.useQuery({
    leagueId: newlyCreatedLeague?.id ?? " ",
  });
  const { mutate: joinLeagueMutate } = api.league.join.useMutation();

  return (
    <div>
      <Button>Hello</Button>
      <button
        className="rounded bg-gray-400 p-4"
        onClick={() => {
          createLeagueMutate({
            isPrivate: false,
            logoUrl:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rocket_League_coverart.jpg/640px-Rocket_League_coverart.jpg",
            name: "pálmiþór",
          });
        }}
      >
        Create League Button
      </button>
      {newlyCreatedLeague ? (
        <button
          className="rounded bg-amber-500 p-4"
          onClick={() => {
            createSeasonMutate({
              name: "Jón Þór",
              leagueId: newlyCreatedLeague?.id,
            });
          }}
        >
          Create Season Button
        </button>
      ) : null}
      {code ? (
        <button
          className="rounded bg-blue-500 p-4"
          onClick={() => {
            joinLeagueMutate(code);
          }}
        >
          Join League Button
        </button>
      ) : null}
    </div>
  );
};

export const getServerSideProps = () => ({
  props: {
    currentTab: "Dashboard",
  },
});

export default Dashboard;
