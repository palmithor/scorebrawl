import { upsertAuthenticatedUser } from "@/actions/user";
import { ErrorToast } from "@/components/error-toast";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { navConfig } from "@/config/nav";
import { auth } from "@clerk/nextjs/server";
import { UserRepository } from "@scorebrawl/db";
import type { ReactNode } from "react";

export default async function LeaguesLayout({ children }: { children: ReactNode }) {
  const { userId } = auth();
  if (userId) {
    const user = await UserRepository.findUserById({ id: userId });
    if (!user) {
      await upsertAuthenticatedUser();
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar userId={userId} items={navConfig.mainNav} />
      <main className="flex-1 container relative">{children}</main>
      <SiteFooter />
      <ErrorToast />
    </div>
  );
}
