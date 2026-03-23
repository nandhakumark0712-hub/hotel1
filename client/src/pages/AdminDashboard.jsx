import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Loader2, 
  Users, 
  Hotel, 
  BookOpen, 
  TrendingUp, 
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/api/admin/stats');
                setStats(data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <div className="premium-card bg-primary p-12 text-white relative overflow-hidden border-none shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-dark/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20">
                            <Zap size={14} className="mr-2 text-yellow-300 fill-yellow-300" /> System Control Center
                        </div>
                        <h1 className="text-5xl font-black tracking-tight leading-tight mb-4">
                            Welcome back, <br /> Admin Master.
                        </h1>
                        <p className="text-white/80 text-lg font-medium leading-relaxed">
                            The platform is running smoothly with <span className="text-white font-black underline decoration-2 underline-offset-4">{stats?.totalBookings} active reservations</span>. All systems are operational and performing at peak capacity.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/analytics" className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 hover:bg-white hover:text-primary transition-all group shadow-xl">
                            <TrendingUp size={32} className="mb-4 group-hover:scale-110 transition-transform" />
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">View Reports</div>
                            <div className="text-xl font-black">Deep Insights</div>
                        </Link>
                        <Link to="/admin/promotions" className="bg-dark p-6 rounded-[2rem] border border-white/5 hover:bg-dark/80 transition-all flex flex-col justify-end">
                            <Zap size={32} className="mb-4 text-primary" />
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Quick Action</div>
                            <div className="text-xl font-black">Launch Promo</div>
                        </Link>
                    </div>
                </div>
            </div>
 
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <QuickStatCard title="Total Platform Users" value={stats?.totalUsers} icon={<Users size={20} />} subText="Active & Verified" color="text-blue-600" bg="bg-blue-50" />
                <QuickStatCard title="Partner Properties" value={stats?.totalHotels} icon={<Hotel size={20} />} subText="Global Hotels" color="text-purple-600" bg="bg-purple-50" />
                <QuickStatCard title="Service Bookings" value={stats?.totalBookings} icon={<BookOpen size={20} />} subText="Confirmed Stays" color="text-orange-600" bg="bg-orange-50" />
                <QuickStatCard title="Global Revenue" value={`₹${stats?.totalRevenue?.toLocaleString('en-IN')}`} icon={<TrendingUp size={20} />} subText="Gross System Value" color="text-green-600" bg="bg-green-50" />
            </div>
        </div>
    );
};

const QuickStatCard = ({ title, value, icon, subText, color, bg }) => (
    <div className="premium-card p-8 border-none shadow-xl group hover:-translate-y-2 transition-transform duration-500 overflow-hidden relative">
        <div className={`absolute -bottom-4 -right-4 text-gray-50 ${color} opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-1000 transform -rotate-12`}>
            {React.cloneElement(icon, { size: 100 })}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 shadow-sm`}>
            {icon}
        </div>
        <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{title}</div>
            <div className={`text-4xl font-black ${color} tracking-tighter mb-2`}>{value}</div>
            <div className="text-xs text-gray-400 font-medium">{subText}</div>
        </div>
    </div>
);

export default AdminDashboard;
