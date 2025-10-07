import "../styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Dashboard",
  description: "Notion-style personal command center",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
