import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { User, Mail, Wallet, Calendar, Edit } from 'lucide-react';

export default async function ProfilePage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('user_account')
        .select('*')
        .eq('id', user.id)
        .single();

    const displayName = profile?.username || user.email?.split('@')[0] || 'User';
    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
    const walletBalance = profile?.wallet_balance || 0;
    const createdAt = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A';

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Profile Header */}
            <div className="bg-[#1b2838] rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-32 h-32 rounded-lg object-cover border-4 border-[#2a475e]"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#c7d5e0] mb-2">{displayName}</h1>
                        <p className="text-[#8f98a0] flex items-center gap-2 mb-4">
                            <Mail size={16} />
                            {user.email}
                        </p>

                        {/* Edit Profile Button */}
                        <button className="px-4 py-2 bg-gradient-to-r from-[#47bfff] to-[#1a44c2] text-white font-medium rounded-lg 
                                         hover:from-[#5cc8ff] hover:to-[#2255dd] transition-all flex items-center gap-2">
                            <Edit size={16} />
                            Chỉnh sửa hồ sơ
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Wallet Balance */}
                <div className="bg-[#1b2838] rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#2a475e] rounded-lg">
                            <Wallet size={20} className="text-[#66c0f4]" />
                        </div>
                        <span className="text-[#8f98a0] text-sm">Số dư ví</span>
                    </div>
                    <p className="text-2xl font-bold text-[#5c7e10]">
                        {walletBalance.toLocaleString('vi-VN')}₫
                    </p>
                </div>

                {/* Member Since */}
                <div className="bg-[#1b2838] rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#2a475e] rounded-lg">
                            <Calendar size={20} className="text-[#66c0f4]" />
                        </div>
                        <span className="text-[#8f98a0] text-sm">Thành viên từ</span>
                    </div>
                    <p className="text-xl font-bold text-[#c7d5e0]">
                        {createdAt}
                    </p>
                </div>

                {/* Account Status */}
                <div className="bg-[#1b2838] rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#2a475e] rounded-lg">
                            <User size={20} className="text-[#66c0f4]" />
                        </div>
                        <span className="text-[#8f98a0] text-sm">Trạng thái</span>
                    </div>
                    <p className="text-xl font-bold text-[#5c7e10]">
                        Đang hoạt động
                    </p>
                </div>
            </div>

            {/* Account Details */}
            <div className="bg-[#1b2838] rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#c7d5e0] mb-4">Thông tin tài khoản</h2>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-[#2a475e]">
                        <span className="text-[#8f98a0] sm:w-48">Tên người dùng</span>
                        <span className="text-[#c7d5e0] font-medium">{displayName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-[#2a475e]">
                        <span className="text-[#8f98a0] sm:w-48">Email</span>
                        <span className="text-[#c7d5e0] font-medium">{user.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-[#2a475e]">
                        <span className="text-[#8f98a0] sm:w-48">ID người dùng</span>
                        <span className="text-[#c7d5e0] font-medium font-mono text-sm">{user.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
