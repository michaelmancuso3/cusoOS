import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { CommandPalette } from "@/components/CommandPalette";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CusoOS // Operations",
  description: "Michael's venture operating system",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const today = todayISO();

  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar today={today} />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar today={today} />
            <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full">
              {children}
            </main>
          </div>
        </div>
        <CommandPalette today={today} />
      </body>
    </html>
  );
}
