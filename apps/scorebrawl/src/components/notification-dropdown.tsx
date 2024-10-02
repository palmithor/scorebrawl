"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: "achievement";
  read: boolean;
}

export const NotificationDropdown = ({
  notifications,
  onClickMarkAsRead,
  onClickMarkAllAsRead,
  unreadCount,
}: {
  notifications: Notification[];
  onClickMarkAsRead: (id: string) => Promise<void>;
  onClickMarkAllAsRead: () => Promise<void>;
  unreadCount: number;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClickMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        {notifications?.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="px-4 py-3 focus:bg-gray-100 dark:focus:bg-gray-800"
          >
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage
                  src={
                    "https://images.pexels.com/photos/6250969/pexels-photo-6250969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  }
                  alt="Avatar"
                />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className={`text-sm ${notification.read ? "text-gray-500" : "font-medium"}`}>
                  {notification.type}
                </p>
                {!notification.read && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={async () => onClickMarkAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        {notifications?.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
