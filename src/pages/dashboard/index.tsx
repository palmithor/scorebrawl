import { type NextPage } from "next";
import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  const { data } = api.league.getAllLeagues.useQuery({});
  const { mutate: createLeagueMutate, data: newlyCreated } =
    api.league.create.useMutation();

  console.log("data", data);
  console.log("newlycreated", newlyCreated);

  return (
    <div>
      <button
        onClick={() => {
          createLeagueMutate({
            initialElo: 1200,
            isPrivate: false,
            logoUrl:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rocket_League_coverart.jpg/640px-Rocket_League_coverart.jpg",
            name: "Jón Þór",
          });
        }}
      >
        Create League Button
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
