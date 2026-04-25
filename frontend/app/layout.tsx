import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UniEvents – Your University Event Hub",
  description: "Discover workshops, hackathons, seminars, fests, and academic events happening at your university. Never miss an event again.",
  keywords: "university events, hackathon, workshop, seminar, fest, campus events",
  openGraph: {
    title: "UniEvents – Your University Event Hub",
    description: "Your centralized platform for all university events.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#1a1a1a' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#1a1a1a' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
