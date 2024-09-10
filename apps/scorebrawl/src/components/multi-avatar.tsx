import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getInitialsFromString } from "@scorebrawl/utils/string";
import { useId } from "react";

export type AvatarProps = { id: string; name: string; imageUrl: string };
export const MultiAvatar = (
  {
    visibleCount,
    users,
  }: {
    visibleCount: number;
    users: AvatarProps[];
  } = { users: [], visibleCount: 5 },
) => {
  const avatarAndName = ({ id, name, imageUrl }: AvatarProps) => {
    return (
      <Tooltip key={id}>
        <TooltipTrigger className="flex">
          <Avatar className={"h-8 w-8"}>
            <AvatarImage src={imageUrl} />
            <AvatarFallback>{getInitialsFromString(name)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <div className={"text-xs"}>{name}</div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const withRemainingCount = () => {
    const firstThree = users.slice(0, visibleCount - 1);
    const remainingCount = users.length - (visibleCount - 1);
    return (
      <>
        {firstThree.map((p) => avatarAndName(p))}
        <Avatar key="remaining" className={cn("h-8 w-8 text-sm")}>
          <AvatarFallback className="text-xs">{`+${remainingCount}`}</AvatarFallback>
        </Avatar>
      </>
    );
  };

  return (
    <div className={cn(users.length > 1 ? "flex -space-x-4" : "")}>
      {users.length <= visibleCount ? users.map(avatarAndName) : withRemainingCount()}
    </div>
  );
};

export const MultiAvatarWithSkeletonLoading = ({
  users,
  visibleCount = 3,
}: { users?: Array<AvatarProps>; visibleCount?: number }) => {
  if (!users) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: visibleCount }).map(() => (
          <Skeleton key={useId()} className="h-8 w-8" />
        ))}
      </div>
    );
  }
  return <MultiAvatar visibleCount={visibleCount} users={users} />;
};
