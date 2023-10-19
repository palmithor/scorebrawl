import { type MainNavItem, type SidebarNavItem } from "~/types/nav";

interface MobileNavConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const mobileNavConfig: MobileNavConfig = {
  mainNav: [
    {
      title: "Leagues",
      href: "/leagues",
    },
  ],
  sidebarNav: [],
};
