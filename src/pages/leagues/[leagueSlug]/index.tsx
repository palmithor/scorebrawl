import { type GetServerSidePropsContext, type NextPage } from "next";

export const getServerSideProps = ({ params }: GetServerSidePropsContext) => {
  if (params?.leagueSlug) {
    return {
      redirect: {
        permanent: false,
        destination: `/leagues/${params?.leagueSlug as string}/overview`,
      },
    };
  }
};

const League: NextPage = () => null;

export default League;
