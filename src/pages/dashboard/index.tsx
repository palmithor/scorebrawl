import { type NextPage } from "next";
import Head from "next/head";

const Dashboard: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Scorebrawl - Dashboard</title>
      </Head>
      <span>Dashboard</span>
    </div>
  );
};

export const getServerSideProps = () => ({
  props: {
    currentTab: "Dashboard",
  },
});

export default Dashboard;
