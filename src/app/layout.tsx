import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WahaSend - Envio em Massa WhatsApp",
  description: "Envie mensagens personalizadas em massa via WhatsApp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-dark antialiased">
        {children}
      </body>
    </html>
  );
}
