import "@scorebrawl/ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scorebrawl",
  description: "",
};

export default ({ children }: { children: React.ReactNode }): JSX.Element => (
  <html lang="en">
    <body className={inter.className}>{children}</body>
  </html>
);
