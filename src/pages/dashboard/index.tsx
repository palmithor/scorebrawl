import { type NextPage } from "next";
import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  //const { data } = api.league.getAll.useQuery({});
  const { mutate: createLeagueMutate, data: newlyCreatedLeague } = api.league.create.useMutation();
  const { mutate: createSeasonMutate, data: newlyCreatedSeason } = api.season.create.useMutation();
  const { data: code } = api.league.getCode.useQuery({ leagueId: newlyCreatedLeague?.id ?? ' ' })
  const { mutate: joinLeagueMutate } = api.league.join.useMutation();

  console.log("newlycreatedleague", newlyCreatedLeague);
  console.log("newlycreatedseason", newlyCreatedSeason);

  return (
    <div >
      <button className="bg-gray-400 p-4 rounded"
        onClick={() => {
          createLeagueMutate({
            isPrivate: false,
            logoUrl:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rocket_League_coverart.jpg/640px-Rocket_League_coverart.jpg",
            name: 'pálmiþór'
          });
        }}
      >
        Create League Button
      </button>
      <button className="bg-amber-500 p-4 rounded"
        onClick={() => {
          createSeasonMutate({
            name: "Jón Þór",
            leagueId: newlyCreatedLeague?.id!!,
          });
        }}
      >
        Create Season Button
      </button>
      <button className="bg-blue-500 p-4 rounded"
        onClick={() => {
          joinLeagueMutate(code!);
        }}
      >
        Join League Button
      </button>
    </div>
  );
};

export const getServerSideProps = () => ({
  props: {
    currentTab: "Dashboard",
  },
});

export default Dashboard;
