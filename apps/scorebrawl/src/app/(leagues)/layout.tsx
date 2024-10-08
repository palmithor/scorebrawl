import { upsertAuthenticatedUser } from "@/actions/user";
import { ErrorToast } from "@/components/error-toast";
import { NavLayout } from "@/components/layout/main-nav";
import { api } from "@/trpc/server";
import { cookies } from "next/headers";

import { auth } from "@clerk/nextjs/server";
import { findUserById } from "@scorebrawl/db/user";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const { userId } = auth();
  if (userId) {
    const user = await findUserById({ id: userId });
    if (!user) {
      await upsertAuthenticatedUser();
    }
  }
  let defaultLayout: number[] | undefined;
  try {
    const cookiesValue = cookies().get("react-resizable-panels:layout")?.value;
    if (cookiesValue) {
      const parsed = JSON.parse(cookiesValue).map(Number);
      if (parsed.length === 2) {
        defaultLayout = parsed;
      }
    }
  } catch (_e) {
    //do nothing and use default
  }
  return (
    <NavLayout
      leagues={await api.league.getAll({})}
      defaultLayout={defaultLayout}
      defaultCollapsed={cookies().get("react-resizable-panels:collapsed")?.value === "true"}
    >
      <>
        {children}
        <ErrorToast />
      </>
    </NavLayout>
  );
}
