import { useRouter } from "next/router";
import { useEffect } from "react";
import { FullPageSpinner } from "~/components/full-page-spinner";
import { api } from "~/lib/api";
import { TOAST_ERROR_PARAM } from "~/lib/url";

const Page = () => {
  const router = useRouter();
  const code = router.query.code as string;
  const { mutate } = api.league.join.useMutation();

  useEffect(() => {
    mutate(
      { code },
      {
        onSuccess: (data) => void router.push(`/leagues/${data.slug}`),
        onError: () => void router.push(`/leagues?${TOAST_ERROR_PARAM}=Unable to join league`),
      },
    );
  }, [mutate, router, code]);

  return <FullPageSpinner />;
};

export default Page;
