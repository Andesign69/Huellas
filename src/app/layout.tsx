import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const heading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refugio Huellas — mascotas del terremoto",
  description: "Reporta y busca mascotas perdidas o encontradas tras el sismo del 10 de agosto en Colombia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${heading.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
