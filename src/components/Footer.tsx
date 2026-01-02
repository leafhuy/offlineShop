import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-steam-bg-header border-t border-steam-border mt-16">
            <div className="container mx-auto px-4 py-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="text-xl font-bold text-steam-text-light mb-4">
                            <span className="text-steam-accent-blue">offline</span>
                            <span>Shop</span>
                        </div>
                        <p className="text-sm text-steam-text-secondary">
                            Your trusted source for game keys at the best prices.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-steam-text-light mb-4 uppercase">
                            Store
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Browse Games
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?filter=specials" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Special Offers
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?filter=new" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    New Releases
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold text-steam-text-light mb-4 uppercase">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/support" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-sm font-semibold text-steam-text-light mb-4 uppercase">
                            Legal
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal" className="text-sm text-steam-text-secondary hover:text-steam-text-light transition-colors">
                                    Legal Information
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-steam-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-steam-text-secondary">
                        © 2024 offlineShop. All rights reserved. All trademarks are property of their respective owners.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-steam-text-secondary">
                            Powered by Supabase
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
