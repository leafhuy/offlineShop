'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/services/auth.service';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn(email, password);

        if (!result.success) {
            setError(result.error || 'Đăng nhập thất bại');
            setLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    }

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#c7d5e0] mb-2">Đăng nhập</h1>
                    <p className="text-[#8f98a0]">Chào mừng trở lại offlineShop</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#c7d5e0] mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#32353c] text-white rounded-lg 
                                     border-none focus:outline-none focus:ring-2 focus:ring-[#66c0f4]
                                     placeholder-[#8f98a0] transition-all"
                            placeholder="Nhập email của bạn"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#c7d5e0] mb-2">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#32353c] text-white rounded-lg 
                                     border-none focus:outline-none focus:ring-2 focus:ring-[#66c0f4]
                                     placeholder-[#8f98a0] transition-all"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#47bfff] to-[#1a44c2] 
                                 text-white font-semibold rounded-lg
                                 hover:from-[#5cc8ff] hover:to-[#2255dd] 
                                 focus:outline-none focus:ring-2 focus:ring-[#66c0f4] focus:ring-offset-2 focus:ring-offset-[#1b2838]
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#2a475e]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-steam-bg-main text-[#8f98a0]">hoặc</span>
                    </div>
                </div>

                {/* Register Link */}
                <p className="text-center text-[#8f98a0]">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-[#66c0f4] hover:text-white font-medium transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
