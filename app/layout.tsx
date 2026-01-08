import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromoVault - Promotional Flyer Gallery",
  description: "Your exclusive gateway to premium promotional materials",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

