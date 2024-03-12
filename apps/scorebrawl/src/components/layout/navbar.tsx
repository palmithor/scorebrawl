"use client";

import { MainNavItem } from "@/components/layout/types";
import useScroll from "@/hooks/useScroll";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ReactNode } from "react";
import { MainNav } from "./main-nav";

interface NavBarProps {
  userId: string | null;
  items?: MainNavItem[];
  children?: ReactNode;
  rightElements?: ReactNode;
  scroll?: boolean;
}

export function NavBar({ userId, items, children, rightElements, scroll = false }: NavBarProps) {
  const scrolled = useScroll(50);
  const { theme, systemTheme } = useTheme();
  const themeInUse = theme === "system" ? systemTheme : theme;

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div className="w-full p-4 flex h-12 items-center justify-between">
        <MainNav items={items}>{children}</MainNav>

        <div className="flex items-center space-x-3">
          {rightElements}
          {userId ? (
            <UserButton appearance={{ baseTheme: themeInUse === "dark" ? dark : undefined }} />
          ) : (
            <>{/*sign in button?*/}</>
          )}
        </div>
      </div>
    </header>
  );
}
