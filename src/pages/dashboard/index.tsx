import { type NextPage } from "next";

const Dashboard: NextPage = () => {
  return <div>Dashboard</div>;
};

export const getServerSideProps = () => ({
  props: {
    currentTab: "Dashboard",
  },
});

export default Dashboard;
