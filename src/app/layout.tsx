import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { Navegacao } from "@/components/Navegacao";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Copa Kartista do Vale",
  description: "Campeonato de kart entre amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${rajdhani.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Navegacao />
        <div className="md:pl-56 pb-20 md:pb-0">{children}</div>
      </body>
    </html>
  );
}
