import { type ReactNode } from "react";
import { PointDiffText } from "~/components/standing/PointDiffText";
import { api } from "~/lib/api";

export const PointsDiff = (id: string): ReactNode | null => {
  const { data } = api.season.playerPointDiff.useQuery({ seasonPlayerId: id });

  return <PointDiffText diff={data?.diff} />;
};
