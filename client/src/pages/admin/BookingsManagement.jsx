import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, Calendar, User, Hotel, CreditCard, Search, XCircle, MoreVertical, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookings = async () => {
        try {
            const { data } = await API.get('/api/admin/bookings');
            setBookings(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Forcibly cancel this booking? The user will be notified.')) return;
        try {
            await API.put(`/api/bookings/${id}/cancel`); // Using existing cancel endpoint
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel');
        }
    };

    const filteredBookings = bookings.filter(b => 
        b._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.hotelId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark tracking-tight">Booking Monitoring</h1>
                    <p className="text-gray-500 mt-1">Global view of all active and historical reservations across the platform.</p>
                </div>
                <button 
                    onClick={fetchBookings}
                    className="flex items-center px-4 py-2 bg-white border rounded-2xl text-sm font-bold text-gray-600 hover:text-primary transition-colors hover:border-primary/20"
                >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by ID, guest name or hotel name..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="premium-card overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">ID & Property</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Guest Details</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Stay Period</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Full Status</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredBookings.map((b) => (
                                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-mono text-[10px] text-gray-400 mb-1">#{b._id.toUpperCase()}</div>
                                        <div className="font-bold text-dark flex items-center">
                                            <Hotel size={14} className="mr-2 text-primary/40" />
                                            {b.hotelId?.name || 'Deleted Property'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3 text-xs">
                                                {b.userId?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-dark leading-none mb-1">{b.userId?.name}</div>
                                                <div className="text-[10px] text-gray-400">{b.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold text-gray-600 flex items-center">
                                            <Calendar size={12} className="mr-2 text-gray-400" />
                                            {new Date(b.checkIn).toLocaleDateString()}
                                            <span className="mx-2 text-gray-300">→</span>
                                            {new Date(b.checkOut).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-primary">₹{b.totalPrice.toLocaleString('en-IN')}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest ${b.paymentStatus === 'Paid' ? 'text-green-500' : 'text-orange-400'}`}>
                                            {b.paymentStatus}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            b.bookingStatus === 'Confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                            b.bookingStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {b.bookingStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {b.bookingStatus !== 'Cancelled' && (
                                                <button 
                                                    onClick={() => handleCancel(b._id)}
                                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn relative"
                                                    title="Cancel Booking"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingsManagement;
