import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, CreditCard, Search, ExternalLink, Calendar, CheckCircle2, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

const PaymentsManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [minAmount, setMinAmount] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await API.get('/api/admin/payments');
            setPayments(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredPayments.length === 0) return alert('No data to export');

        const headers = ['User', 'Email', 'Hotel', 'Amount', 'Date', 'Status', 'Transaction ID'];
        const rows = filteredPayments.map(p => [
            p.userId?.name || 'Unknown',
            p.userId?.email || 'N/A',
            p.hotelId?.name || 'N/A',
            p.totalPrice,
            new Date(p.updatedAt).toLocaleString(),
            p.paymentStatus || 'Paid',
            p.paymentId || p._id
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `payments_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredPayments = payments
        .filter(p => {
            const matchesSearch = 
                p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.hotelId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.paymentId?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesAmount = minAmount === '' || p.totalPrice >= parseFloat(minAmount);
            
            return matchesSearch && matchesAmount;
        })
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.updatedAt) - new Date(a.updatedAt);
            if (sortOrder === 'oldest') return new Date(a.updatedAt) - new Date(b.updatedAt);
            if (sortOrder === 'highest') return b.totalPrice - a.totalPrice;
            if (sortOrder === 'lowest') return a.totalPrice - b.totalPrice;
            return 0;
        });

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.totalPrice, 0);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark tracking-tight">Payments & Revenue</h1>
                    <p className="text-gray-500 mt-1">Track every transaction and monitor total system income.</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 px-6 py-4 rounded-3xl flex items-center shadow-inner">
                    <div className="mr-6">
                        <div className="text-xs text-primary/60 font-black uppercase tracking-widest">Total Revenue</div>
                        <div className="text-3xl font-black text-primary">₹{totalRevenue.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
                        <CreditCard size={24} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by user, hotel or transaction ID..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExportCSV}
                            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl text-sm transition-all hover:bg-black shadow-lg"
                        >
                            Export CSV
                        </button>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 font-bold rounded-2xl text-sm border flex items-center gap-2 transition-all ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-dark hover:bg-gray-50'}`}
                        >
                            <Sliders size={16} />
                            <span>Filters</span>
                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-primary/10 animate-fade-in-up flex flex-wrap gap-8 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Min Amount (₹)</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                className="w-40 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
                            <select 
                                className="w-48 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Amount</option>
                                <option value="lowest">Lowest Amount</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => { setMinAmount(''); setSortOrder('newest'); }}
                            className="text-xs font-bold text-primary hover:underline pb-3"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            <div className="premium-card overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">User / Customer</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Property Name</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Amount</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Date & Time</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Status</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredPayments.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black mr-4 shadow-sm">
                                                {p.userId?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-dark">{p.userId?.name || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-400">{p.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center font-semibold text-gray-700">
                                            <Calendar className="w-4 h-4 mr-2 text-primary/40" />
                                            {p.hotelId?.name}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-lg font-black text-primary">₹{p.totalPrice.toLocaleString('en-IN')}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm text-gray-600 font-medium">{new Date(p.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-green-100 text-green-700">
                                            <CheckCircle2 size={12} className="mr-1" />
                                            Successful
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                            <ExternalLink size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayments.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <CreditCard size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">No payment records found</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsManagement;
