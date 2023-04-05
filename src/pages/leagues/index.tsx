import { type GetServerSidePropsResult, type NextPage } from "next";
import { type NavbarTab } from "~/components/layout/navbar";
import { api } from "~/utils/api";

const Leagues: NextPage = () => {
  return <div>hello leagues</div>;
};

export const getServerSideProps = (): GetServerSidePropsResult<{
  currentTab: NavbarTab;
}> => ({ props: { currentTab: "Leagues" } });

export default Leagues;
