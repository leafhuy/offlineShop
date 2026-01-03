import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllGenres } from "@/services/game.service";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "offlineShop - Game Key Store",
    description: "Your trusted source for game keys at the best prices. Browse thousands of games with instant delivery.",
    keywords: ["game keys", "steam keys", "game store", "pc games", "digital games"],
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch genres for navbar mega menu
    const genres = await getAllGenres();

    return (
        <html lang="en">
            <body className={`${inter.className} bg-steam-bg-main text-steam-text-primary min-h-screen`}>
                <AuthProvider>
                    <CartProvider>
                        <CurrencyProvider>
                            <Navbar genres={genres} />
                            <main className="min-h-screen">
                                {children}
                            </main>
                            <Footer />
                            <Toaster
                                theme="dark"
                                position="top-right"
                                richColors
                                closeButton
                            />
                        </CurrencyProvider>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

