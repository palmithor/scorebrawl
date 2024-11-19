"use client";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function NavClerkUser() {
  const { theme, systemTheme } = useTheme();
  const themeInUse = theme === "system" ? systemTheme : theme;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Profile">
          <UserButton
            showName={true}
            appearance={{
              elements: {
                userButtonBox: "w-full h-full flex flex-row-reverse justify-end",
                rootBox: "w-full nowrap truncate",
                avatarBox: "h-4 w-4",
                userButtonTrigger: "w-full ",
              },
              baseTheme: themeInUse === "dark" ? dark : undefined,
            }}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
