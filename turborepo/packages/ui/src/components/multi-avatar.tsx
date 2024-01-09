import {Tooltip, TooltipContent, TooltipTrigger} from "./tooltip";
import {Avatar, AvatarFallback, AvatarImage} from "./avatar";
import {cn} from "../lib";
import {getInitialsFromString} from "@scorebrawl/utils/string";

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
                <TooltipTrigger>
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
        <div className="flex -space-x-4">
            {users.length <= visibleCount ? users.map(avatarAndName) : withRemainingCount()}
        </div>
    );
};
