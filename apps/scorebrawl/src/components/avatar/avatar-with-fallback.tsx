import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitialsFromString } from "@scorebrawl/utils/string";
import { type VariantProps, cva } from "class-variance-authority";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-6 h-6",
      sm: "h-6 w-6",
      md: "h-8 w-8",
      xl: "h-32 w-32",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type AvatarVariantProp = VariantProps<typeof avatarVariants>;

export const AvatarWithFallback = ({
  image,
  name,
  size,
  className,
}: { image?: string; name: string } & AvatarVariantProp & React.HTMLAttributes<HTMLDivElement>) => (
  <Avatar className={cn(avatarVariants({ size, className }))}>
    <AvatarImage src={image} />
    <AvatarFallback>{getInitialsFromString(name)}</AvatarFallback>
  </Avatar>
);
