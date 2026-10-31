import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RevealObserver } from "@/components/RevealObserver";
import { ScrollRunner } from "@/components/ScrollRunner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Team Blekinge Löparförening – löparklubb i Karlskrona",
    template: "%s – Team Blekinge LF",
  },
  description:
    "Löparklubb i Karlskrona för alla typer av löpare. Intervaller varje tisdag kl. 18 från klubblokalen på Tennvägen 11 A i Torskors. Arrangör av Jämjöhalvan och Kustmaran.",
  icons: { icon: "/img/logo-emblem.png" },
};

export const viewport: Viewport = {
  themeColor: "#221E1F",
};

// Set before first paint so entrance animations never flash: content is only
// hidden-for-animation when JS runs and the visitor hasn't asked for less motion.
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <ScrollRunner />
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
