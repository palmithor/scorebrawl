import type { AvatarProps } from "@/components/multi-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getInitialsFromString } from "@scorebrawl/utils/string";
import type { VariantProps } from "class-variance-authority";

export interface AvatarBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  item: AvatarProps;
}

export const AvatarBadge = ({ item, variant, onClick, className, children }: AvatarBadgeProps) => {
  return (
    <Badge
      key={item.id}
      variant={variant}
      className={cn("mr-2 text-xs px-3 w-32", className)}
      onClick={onClick}
    >
      <Avatar className="h-6 w-6 mr-2">
        <AvatarImage src={item.imageUrl} />
        <AvatarFallback>{getInitialsFromString(item.name)}</AvatarFallback>
      </Avatar>
      <p className="truncate">{item.name}</p>
      {children}
    </Badge>
  );
};
