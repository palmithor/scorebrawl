import type { NextPage } from "next";
import { CreateLeagueForm } from "~/components/league/CreateLeagueForm";
import { FormLayout } from "~/components/layout/form-layout";

const Leagues: NextPage = () => {
  return (
    <FormLayout title={"Create League"}>
      <CreateLeagueForm />
    </FormLayout>
  );
};

export default Leagues;
