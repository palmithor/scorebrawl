import { type GetServerSidePropsResult, type NextPage } from "next";
import { type NavbarTab } from "~/components/layout/navbar";

const Leagues: NextPage = () => {
  return <div>hello leagues</div>;
};

export const getServerSideProps = (): GetServerSidePropsResult<{
  currentTab: NavbarTab;
}> => ({ props: { currentTab: "Leagues" } });

export default Leagues;
