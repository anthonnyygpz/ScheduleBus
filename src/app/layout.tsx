import { SWRProvider } from "@/components/swr-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShiftFlow - Gestion Inteligente de Horarios",
  description:
    "Genera horarios dinamicos, reestructura automaticamente ante ausencias y monitorea jornadas en tiempo real.",
  generator: "v0.app",
  icons: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SWRProvider>
          {children}
          <Analytics />
          <Toaster />
        </SWRProvider>
      </body>
    </html>
  );
}
