import { useRouter } from "next/router";

export const useLeagueSlug = () => {
  const router = useRouter();
  return router.query.leagueSlug as string;
};
