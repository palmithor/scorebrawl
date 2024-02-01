import { type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export const AvatarName = ({
  name,
  avatarUrl,
  children,
  avatarClassName,
}: {
  name: string;
  avatarUrl?: string;
  avatarClassName?: string;
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
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-4">
        <h2 className={"text-sm"}>{name}</h2>
        {children}
      </div>
    </div>
  );
};
