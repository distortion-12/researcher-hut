import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "researcher.hut | Research & Insights",
  description: "Deep dives into psychology, human behavior, and the patterns that shape our lives.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 mt-20 py-8 text-center text-gray-500 text-sm">
            <p>🔬 researcher.hut — Research & Insights</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
