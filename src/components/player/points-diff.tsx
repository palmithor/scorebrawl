import { type ReactNode } from "react";
import { api } from "~/lib/api";
import { PointDiffText } from "~/components/standing/PointDiffText";

export const PointsDiff = (id: string): ReactNode | null => {
  const { data } = api.season.playerPointDiff.useQuery({ seasonPlayerId: id });

  return <PointDiffText diff={data?.diff} />;
};
