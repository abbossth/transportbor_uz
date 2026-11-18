import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AssistantPanel } from "@/components/AssistantPanel";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "TransportBor — kichik yuk uchun qatnov toping",
  description: "Yukingizga mos qatnovni bir daqiqada toping. Kichik yuk jo‘natish uchun qatnovlar ro‘yxati.",
  icons: { icon: "/brand/transportbor-icon.svg", apple: "/brand/transportbor-app-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1A" },
  ],
};

// Sahifa chizilishidan oldin mavzuni qo‘llaydi (miltillashsiz).
const themeScript = `(function(){try{var t=localStorage.getItem("tb-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${inter.variable} ${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-pop"
        >
          Asosiy qismga o‘tish
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <AssistantPanel />
      </body>
    </html>
  );
}
