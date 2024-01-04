import { ErrorToast } from "@/components/error-toast";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div>header</div>
      {children}
      <div>footer</div>
      <ErrorToast />
    </div>
  );
}
