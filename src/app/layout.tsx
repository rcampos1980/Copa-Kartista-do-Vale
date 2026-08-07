import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { Navegacao } from "@/components/Navegacao";
import { Rastreador } from "@/components/Rastreador";
import { createClient } from "@/lib/supabase/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = perfil?.role === "admin";
  }

  return (
    <html lang="pt-BR" className={`${rajdhani.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Rastreador />
        <Navegacao isAdmin={isAdmin} />
        <div className="md:pl-56 pb-20 md:pb-0">{children}</div>
      </body>
    </html>
  );
}
