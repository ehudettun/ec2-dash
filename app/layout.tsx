import type { Metadata } from "next";
import { Inter } from "next/font/google";
// These styles apply to every route in the application
import './globals.css';
import ClientProvider from './providers/ClientProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EC2 Dashboard",
  description: "Ehud Ettun HW Assignment",
};

export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
