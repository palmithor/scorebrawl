import { type ReactNode } from "react";
import { FormDots } from "~/components/standing/form-dots";
import { api } from "~/lib/api";

export const Form = (id: string): ReactNode | null => {
  const { data } = api.season.playerForm.useQuery({ seasonPlayerId: id });

  return data ? <FormDots form={data} /> : null;
};
