import type { GetServerSidePropsResult, NextPage } from "next";
import type { NavbarTab } from "~/components/layout/navbar";
import { CreateLeagueForm } from "~/components/league/CreateLeagueForm";

const Leagues: NextPage = () => {
  return <CreateLeagueForm />;
};

export const getServerSideProps = (): GetServerSidePropsResult<{
  currentTab: NavbarTab;
}> => ({ props: { currentTab: "Leagues" } });

export default Leagues;
