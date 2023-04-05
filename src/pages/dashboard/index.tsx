import { type NextPage } from "next";
import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  const { data } = api.league.getLeaguesByUserId.useQuery({ userId: "" });
  return <div>hello dashboard</div>;
};

export const getServerSideProps = () => ({
  props: {
    currentTab: "Dashboard",
  },
});

export default Dashboard;
