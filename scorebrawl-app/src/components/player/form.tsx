import { type ReactNode } from "react";
import { api } from "~/lib/api";
import { FormDots } from "~/components/standing/form-dots";

export const Form = (id: string): ReactNode | null => {
  const { data } = api.season.playerForm.useQuery({ seasonPlayerId: id });

  return data ? <FormDots form={data} /> : null;
};
