import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "researcher.hut | Research & Insights",
  description: "Deep dives into psychology, human behavior, and the patterns that shape our lives.",
  icons: {
    icon: [
      { url: '/icon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
              {children}
            </main>
            <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 sm:mt-16 md:mt-20 py-6 sm:py-8 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-4">
              <p>🔬 researcher.hut — Research & Insights</p>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
