import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "IVO V2 - Intelligent Vocabulary Organizer",
    template: "%s | IVO V2"
  },
  description: "Sistema avançado de geração hierárquica de materiais didáticos para ensino de idiomas com IA generativa.",
  keywords: [
    "English teaching", 
    "AI-powered education", 
    "CEFR", 
    "Vocabulary organizer", 
    "Language learning",
    "Pedagogical content",
    "IPA phonetics"
  ],
  authors: [{ name: "IVO Team" }],
  creator: "IVO V2 Development Team",
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    title: "IVO V2 - Intelligent Vocabulary Organizer",
    description: "Sistema avançado de geração hierárquica de materiais didáticos para ensino de idiomas com IA generativa.",
    siteName: "IVO V2"
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}