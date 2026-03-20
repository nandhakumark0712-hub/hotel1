import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, TrendingUp, DollarSign, Users, Calendar, Award } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

const Analytics = () => {
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

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const formattedRevenue = stats?.monthlyRevenue?.map(item => ({
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    revenue: item.revenue
  })) || [];

  const formattedUsers = stats?.userGrowth?.map(item => ({
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    users: item.count
  })) || [];

  const COLORS = ['#FF5A36', '#4F46E5', '#10B981', '#F59E0B', '#6366F1'];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-dark tracking-tight">System Intelligence</h1>
        <p className="text-gray-500 mt-1">Real-time data visualization of revenue, user growth and property performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Overall Revenue" value={`₹${stats?.totalRevenue?.toLocaleString('en-IN')}`} icon={<DollarSign size={20} />} trend="+12.4%" color="bg-emerald-500" />
          <StatCard title="Active Users" value={stats?.totalUsers} icon={<Users size={20} />} trend="+5.2%" color="bg-indigo-500" />
          <StatCard title="Total Bookings" value={stats?.totalBookings} icon={<Calendar size={20} />} trend="+8.1%" color="bg-orange-500" />
          <StatCard title="Properties" value={stats?.totalHotels} icon={<Award size={20} />} trend="+2.0%" color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-8 min-h-[450px] border-none shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-xl font-black text-dark tracking-tight">Revenue Stream</h3>
                <p className="text-xs text-gray-400">Monthly financial performance</p>
             </div>
             <TrendingUp className="text-emerald-500" size={24} />
          </div>
          <div className="h-[350px] mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedRevenue}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-8 min-h-[450px] border-none shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-xl font-black text-dark tracking-tight">User Acquisition</h3>
                <p className="text-xs text-gray-400">New registration trends</p>
             </div>
             <Users className="text-indigo-500" size={24} />
          </div>
          <div className="h-[350px] mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedUsers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="users" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-8 border-none shadow-xl overflow-hidden">
          <h3 className="text-xl font-black text-dark tracking-tight mb-8">Top Performing Assets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 rounded-xl overflow-hidden">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Hotel Resource</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-right">Volume</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.mostBooked?.map((h, i) => (
                  <tr key={h._id || i} className="group hover:bg-gray-50/20 transition-colors">
                    <td className="px-6 py-5">
                       <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs font-black text-white ${COLORS[i % COLORS.length]}`}>
                             {i + 1}
                          </div>
                          <span className="font-bold text-dark group-hover:text-primary transition-colors">{h.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-gray-700">{h.count} <span className="text-[10px] text-gray-400">units</span></td>
                    <td className="px-6 py-5 text-right w-32">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(h.count / stats.totalBookings) * 100 * 5}%` }}></div>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="premium-card p-8 border-none shadow-xl flex flex-col">
            <h3 className="text-xl font-black text-dark tracking-tight mb-8">System Distribution</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Users', value: stats.totalUsers },
                                { name: 'Bookings', value: stats.totalBookings },
                                { name: 'Hotels', value: stats.totalHotels }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {formattedRevenue.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                    <LegendItem label="Users" color={COLORS[0]} />
                    <LegendItem label="Bookings" color={COLORS[1]} />
                    <LegendItem label="Hotels" color={COLORS[2]} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="premium-card p-6 border-none shadow-xl flex items-center space-x-6">
    <div className={`${color} text-white p-4 rounded-2xl shadow-lg`}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{title}</div>
      <div className="text-2xl font-black text-dark leading-none">{value}</div>
      <div className="text-[10px] text-emerald-500 font-bold mt-1.5">{trend} from last month</div>
    </div>
  </div>
);

const LegendItem = ({ label, color }) => (
    <div className="flex items-center text-xs font-bold text-gray-500">
        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: color }}></div>
        {label}
    </div>
)

export default Analytics;
