import { FormDots } from "@/components/league/player-form";
import { api } from "@/trpc/react";
import type { PlayerForm } from "@scorebrawl/api";
import { AvatarName, AvatarNameSkeleton } from "@scorebrawl/ui/avatar-name";
import { Skeleton } from "@scorebrawl/ui/skeleton";
import { Flame, Snowflake } from "lucide-react";
import { CardContentText } from "./CardContentText";
import { DashboardCard } from "./DashboardCard";

export const StrugglingCard = ({
  leagueSlug,
  seasonSlug,
}: { leagueSlug: string; seasonSlug: string }) => {
  const { data, isLoading } = api.seasonPlayer.getStruggling.useQuery({ leagueSlug, seasonSlug });
  return <PlayerFormCard title={"Struggling"} player={data} isLoading={isLoading} />;
};

export const OnFireCard = ({
  leagueSlug,
  seasonSlug,
}: { leagueSlug: string; seasonSlug: string }) => {
  const { data, isLoading } = api.seasonPlayer.getOnFire.useQuery({ leagueSlug, seasonSlug });
  return <PlayerFormCard title={"On Fire"} player={data} isLoading={isLoading} />;
};

const PlayerFormCard = ({
  title,
  isLoading,
  player,
}: {
  player?: { name: string; imageUrl: string; form: PlayerForm };
  isLoading?: boolean;
  title: "On Fire" | "Struggling";
}) => {
  const Icon = title === "On Fire" ? Flame : Snowflake;
  return (
    <DashboardCard title={title} Icon={Icon}>
      {!player && !isLoading && <CardContentText>No Matches</CardContentText>}
      {isLoading && (
        <AvatarNameSkeleton>
          <Skeleton className={"mt-1 h-4 w-20"} />
        </AvatarNameSkeleton>
      )}
      {player && (
        <div className="flex items-center">
          <AvatarName name={player.name} imageUrl={player.imageUrl}>
            <FormDots form={player.form} />
          </AvatarName>
        </div>
      )}
    </DashboardCard>
  );
};
