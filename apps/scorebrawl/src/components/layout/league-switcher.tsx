"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@scorebrawl/ui/avatar";
import { cn } from "@scorebrawl/ui/lib";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@scorebrawl/ui/select";
import { Separator } from "@scorebrawl/ui/separator";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeagueSwitcherProps {
  isCollapsed: boolean;
  leagues: { id: string; slug: string; name: string; logoUrl: string | null }[];
  selectedLeague?: { id: string; slug: string; name: string; logoUrl: string | null };
  onLeagueSelect: (leagueId: string) => void;
}

export function LeagueSwitcher({
  isCollapsed,
  leagues,
  selectedLeague,
  onLeagueSelect,
}: LeagueSwitcherProps) {
  const router = useRouter();
  return (
    <Select
      defaultValue={selectedLeague?.name}
      onValueChange={(value) => {
        if (value === "create") {
          router.push("/leagues/create");
        } else {
          document.cookie = `last-visited-league=${value}`;
          onLeagueSelect(value);
        }
      }}
    >
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden",
        )}
        aria-label="Select League"
      >
        <SelectValue placeholder="Select a league">
          <Avatar className="h-6 w-6">
            <AvatarImage src={selectedLeague?.logoUrl ?? ""} />
            <AvatarFallback>{`${selectedLeague?.name.charAt(0).toUpperCase()}`}</AvatarFallback>
          </Avatar>
          <span className={cn("ml-1", isCollapsed && "hidden")}>{selectedLeague?.name}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Leagues</SelectLabel>
          {leagues.map((league) => (
            <SelectItem key={league.slug} value={league.slug}>
              <div className="flex items-center gap-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={league.logoUrl ?? ""} />
                  <AvatarFallback>{`${league.name.charAt(0).toUpperCase()}`}</AvatarFallback>
                </Avatar>
                {league.name}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        <Separator className="my-2" />
        <SelectGroup>
          <SelectItem className="mt-2 " value="create">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  <PlusIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              Create League
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
