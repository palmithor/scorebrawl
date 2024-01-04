import { ErrorToast } from "@/components/error-toast";
import { NavBar } from "@/components/layout/navbar";
import { navConfig } from "@/config/nav";
import { auth } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const { userId } = auth();
  return (
    <div>
      <NavBar userId={userId} items={navConfig.mainNav} />
      <div className="container relative flex-1">{children}</div>
      <div>footer</div>
      <ErrorToast />
    </div>
  );
}
