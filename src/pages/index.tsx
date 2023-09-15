import { getCookie } from "cookies-next";
import { type GetServerSidePropsContext } from "next";
import { getAuth } from "@clerk/nextjs/server";

const Page = () => {
  // Your UI Here or just return it as null
  return null;
};

export const getServerSideProps = ({ req, res }: GetServerSidePropsContext) => {
  let latestLeagueSlug;
  try {
    const auth = getAuth(req);
    latestLeagueSlug = getCookie(`${auth.userId}:league`, { req, res });
  } catch (e) {}

  return {
    redirect: {
      permanent: false,
      destination: `/leagues/${latestLeagueSlug ?? ""}`,
    },
  };
};
export default Page;
