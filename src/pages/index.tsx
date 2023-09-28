import { getCookie } from "cookies-next";
import { type GetServerSidePropsContext } from "next";
import { latestOpenLeagueCookie } from "~/pages/leagues/[leagueSlug]";

const Page = () => {
  // Your UI Here or just return it as null
  return null;
};

export const getServerSideProps = ({ req, res }: GetServerSidePropsContext) => {
  const latestLeagueSlug = getCookie(latestOpenLeagueCookie, { req, res });

  return {
    redirect: {
      permanent: false,
      destination: `/leagues/${latestLeagueSlug ?? ""}`,
    },
  };
};
export default Page;
