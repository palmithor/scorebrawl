import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Skeleton } from "./skeleton";

export const AvatarName = ({
  name,
  imageUrl,
  children,
  textClassName,
  avatarClassName,
}: {
  name: string;
  imageUrl?: string;
  avatarClassName?: string;
  textClassName?: string;
  children?: ReactNode;
}) => {
  const initials = name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center">
      <div className="relative">
        <Avatar className={avatarClassName}>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-2">
        <h2 className={textClassName ?? "text-sm"}>{name}</h2>
        {children}
      </div>
    </div>
  );
};

export const AvatarNameSkeleton = ({
  textClassName,
  avatarClassName,
  children,
}: { avatarClassName?: string; textClassName?: string; children?: ReactNode }) => (
  <div className="flex items-center">
    <div className="relative">
      <Skeleton className={avatarClassName ?? "h-10 w-10"} />
    </div>
    <div className="ml-2">
      <Skeleton className={textClassName ?? "h-4 w-32"} />
      {children}
    </div>
  </div>
);
