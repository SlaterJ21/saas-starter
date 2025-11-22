import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/Toaster';
import { QueryProvider } from '@/lib/providers/query-provider';
import PerformanceMonitor from '@/components/PerformanceMonitor';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Task Manager - Efficient Project & Team Management",
    description: "Modern task management application with real-time collaboration",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <QueryProvider>
            {children}
            <Toaster />
            <PerformanceMonitor />
        </QueryProvider>
        </body>
        </html>
    );
}