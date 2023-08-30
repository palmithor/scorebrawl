import { getInitialsFromString } from "~/lib/string-utils";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const MultiAvatar = (
  {
    visibleCount,
    users,
  }: {
    visibleCount: number;
    users: { id: string; name: string; imageUrl: string }[];
  } = { users: [], visibleCount: 5 }
) => {
  if (users.length <= visibleCount) {
    return (
      <div className="flex -space-x-4">
        {users.map((p) => (
          <Avatar key={p.id} className={"h-8 w-8"}>
            <AvatarImage src={p.imageUrl} />
            <AvatarFallback>{getInitialsFromString(p.name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  } else {
    const firstThree = users.slice(0, visibleCount - 1);
    const remainingCount = users.length - (visibleCount - 1);
    return (
      <div className="flex -space-x-4">
        {firstThree.map((p) => (
          <Avatar key={p.id} className={"h-8 w-8"}>
            <AvatarImage src={p.imageUrl} />
            <AvatarFallback>{getInitialsFromString(p.name)}</AvatarFallback>
          </Avatar>
        ))}
        <Avatar className={cn("h-8 w-8 text-sm")}>
          <AvatarFallback className="text-xs">{`+${remainingCount}`}</AvatarFallback>
        </Avatar>
      </div>
    );
  }
};
