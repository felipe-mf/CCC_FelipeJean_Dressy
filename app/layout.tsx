import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Dressy — Moda circular com estilo pessoal",
  description:
    "Marketplace de brechós e vendedores independentes com recomendações de estilo por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="#C2622A"
          height={3}
          shadow="0 0 10px #C2622A, 0 0 5px #C2622A"
          showSpinner={false}
        />
        {children}
      </body>
    </html>
  );
}
