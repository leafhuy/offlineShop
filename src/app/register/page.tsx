'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/services/auth.service';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        const result = await signUp(email, password, username);

        if (!result.success) {
            setError(result.error || 'Đăng ký thất bại');
            setLoading(false);
            return;
        }

        // Redirect to login or home
        router.push('/login?registered=true');
    }

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#c7d5e0] mb-2">Tạo tài khoản</h1>
                    <p className="text-[#8f98a0]">Tham gia offlineShop ngay hôm nay</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Username Input */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-[#c7d5e0] mb-2">
                            Tên người dùng
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-[#32353c] text-white rounded-lg 
                                     border-none focus:outline-none focus:ring-2 focus:ring-[#66c0f4]
                                     placeholder-[#8f98a0] transition-all"
                            placeholder="Nhập tên người dùng"
                            required
                        />
                    </div>

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
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            required
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#c7d5e0] mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#32353c] text-white rounded-lg 
                                     border-none focus:outline-none focus:ring-2 focus:ring-[#66c0f4]
                                     placeholder-[#8f98a0] transition-all"
                            placeholder="Nhập lại mật khẩu"
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
                        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
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

                {/* Login Link */}
                <p className="text-center text-[#8f98a0]">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-[#66c0f4] hover:text-white font-medium transition-colors">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
