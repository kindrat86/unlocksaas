import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Unlock SaaS — Your First Paying Customer in 60 Days",
  description:
    "A machine that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(GeistSans.variable, GeistMono.variable, "dark")}>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
