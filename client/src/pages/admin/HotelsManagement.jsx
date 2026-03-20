import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, Hotel, CheckCircle, XCircle, Search, MapPin, Mail, Trash2, ExternalLink, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HotelsManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHotels = async () => {
    try {
      const { data } = await API.get('/api/admin/hotels');
      setHotels(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleStatusUpdate = async (hotelId, isApproved) => {
    try {
      await API.put(`/api/admin/hotels/${hotelId}`, { isApproved });
      setHotels(hotels.map(h => h._id === hotelId ? { ...h, isApproved } : h));
      toast.success(isApproved ? 'Hotel live on platform!' : 'Hotel status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Erase this hotel from existence? All rooms and settings will be lost.')) return;
    try {
      await API.delete(`/api/admin/hotels/${hotelId}`);
      toast.success('Hotel removed successfully');
      setHotels(hotels.filter(h => h._id !== hotelId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting hotel');
    }
  };

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-black text-dark tracking-tight">Hotel Listings</h1>
          <p className="text-gray-500 mt-1">Approve registrations, monitor ratings, and manage property availability.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-orange-100 flex items-center">
                <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest mr-4">Pending Approval</div>
                <div className="text-2xl font-black text-orange-500">{hotels.filter(h => !h.isApproved).length}</div>
            </div>
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-green-100 flex items-center">
                <div className="text-[10px] text-green-400 font-black uppercase tracking-widest mr-4">Live Properties</div>
                <div className="text-2xl font-black text-green-600">{hotels.filter(h => h.isApproved).length}</div>
            </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search by hotel name, city or manager..."
          className="w-full pl-16 pr-6 py-4 bg-white border-none rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredHotels.map((h) => (
          <div key={h._id} className="premium-card p-0 overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 group">
             <div className="flex flex-col sm:flex-row h-full">
                <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden">
                    <img 
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'} 
                        alt={h.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur shadow-sm ${
                            h.isApproved ? 'text-green-600' : 'text-orange-500'
                        }`}>
                            {h.isApproved ? 'Approved' : 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black text-dark tracking-tight">{h.name}</h3>
                            <div className="flex items-center text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star size={14} className="fill-yellow-500 mr-1" /> {h.rating || '0.0'}
                            </div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={14} className="mr-2 text-primary/40" /> {h.location?.address}, {h.location?.city}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Mail size={14} className="mr-2 text-primary/40" /> {h.managerId?.email}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex gap-2">
                             {!h.isApproved ? (
                                <button 
                                    onClick={() => handleStatusUpdate(h._id, true)} 
                                    className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                >
                                    <CheckCircle size={16} className="mr-2" /> Approve
                                </button>
                             ) : (
                                <button 
                                    onClick={() => handleStatusUpdate(h._id, false)} 
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all shadow-sm"
                                >
                                    <XCircle size={16} className="mr-2" /> Suspend
                                </button>
                             )}
                             <button 
                                onClick={() => handleDelete(h._id)}
                                className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                             >
                                <Trash2 size={18} />
                             </button>
                        </div>
                        
                        <a href={`/hotels/${h._id}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-bold flex items-center">
                            View <ExternalLink size={14} className="ml-1" />
                        </a>
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
          <div className="py-20 text-center">
            <Hotel size={64} className="mx-auto text-gray-100 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">No properties found</h3>
          </div>
      )}
    </div>
  );
};

export default HotelsManagement;
