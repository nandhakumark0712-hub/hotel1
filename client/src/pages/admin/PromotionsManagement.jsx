import React, { useState } from 'react';
import API from '../../services/api';
import { Megaphone, Send, Percent, Tag, Link2, Info, Loader2, Sparkles, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PromotionsManagement = () => {
    const [loading, setLoading] = useState(false);
    const [hotels, setHotels] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        discount: '',
        offerLink: '',
        hotelId: ''
    });
    const [fetchingHotels, setFetchingHotels] = useState(false);
    const [promotions, setPromotions] = useState([]);
    const [fetchingPromotions, setFetchingPromotions] = useState(false);

    const fetchPromotions = async () => {
        setFetchingPromotions(true);
        try {
            const { data } = await API.get('/api/admin/promotions');
            if (data.success) {
                setPromotions(data.data);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setFetchingPromotions(false);
        }
    };

    React.useEffect(() => {
        const fetchHotels = async () => {
            setFetchingHotels(true);
            try {
                const { data } = await API.get('/api/admin/hotels');
                if (data.success) {
                    setHotels(data.data);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
            } finally {
                setFetchingHotels(false);
            }
        };
        fetchHotels();
        fetchPromotions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'hotelId' && value) {
            const selectedHotel = hotels.find(h => h._id === value);
            setFormData({
                ...formData,
                hotelId: value,
                offerLink: `${window.location.origin}/hotels/${value}`
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            return toast.error('Please fill in title and message');
        }

        setLoading(true);
        try {
            await API.post('/api/admin/promote', formData);
            toast.success('Promotional campaign launched successfully!');
            setFormData({ title: '', message: '', discount: '', offerLink: '', hotelId: '' });
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion? This will remove it from the landing page.')) return;
        try {
            const { data } = await API.delete(`/api/admin/promotions/${id}`);
            if (data.success) {
                toast.success('Promotion deleted successfully');
                fetchPromotions();
            }
        } catch (error) {
            toast.error('Failed to delete promotion');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary animate-pulse">
                    <Megaphone size={32} />
                </div>
                <h1 className="text-4xl font-black text-dark tracking-tight">Campaign Manager</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Blast promotional emails and real-time notifications to all your customers. 
                    Drive engagement and increase bookings instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 premium-card p-10 border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-dark uppercase tracking-widest flex items-center">
                                    <Tag size={12} className="mr-1 text-primary" /> Campaign Title
                                </label>
                                <input 
                                    type="text" 
                                    name="title"
                                    placeholder="e.g., Summer Getaway Special"
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-semibold"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-dark uppercase tracking-widest flex items-center">
                                    <Percent size={12} className="mr-1 text-primary" /> Discount Badge (%)
                                </label>
                                <input 
                                    type="number" 
                                    name="discount"
                                    placeholder="e.g., 25"
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-semibold"
                                    value={formData.discount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-dark uppercase tracking-widest flex items-center">
                                <Info size={12} className="mr-1 text-primary" /> Marketing Message
                            </label>
                            <textarea 
                                name="message"
                                rows="5"
                                placeholder="Write a compelling message that makes people want to book immediately..."
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-semibold resize-none"
                                value={formData.message}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-dark uppercase tracking-widest flex items-center">
                                <Sparkles size={12} className="mr-1 text-primary" /> Target Hotel (Optional)
                            </label>
                            <select 
                                name="hotelId"
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-semibold cursor-pointer"
                                value={formData.hotelId}
                                onChange={handleChange}
                            >
                                <option value="">General Blast (No specific hotel)</option>
                                {hotels.map(hotel => (
                                    <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 font-medium px-2 italic">Selecting a hotel will automatically pre-fill the URL below.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-dark uppercase tracking-widest flex items-center">
                                <Link2 size={12} className="mr-1 text-primary" /> Action Link (URL) / Hotel Page
                            </label>
                            <input 
                                type="text" 
                                name="offerLink"
                                placeholder={`${window.location.origin}/hotel/65b...`}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-semibold"
                                value={formData.offerLink}
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transform transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-3" />
                            ) : (
                                <Send className="mr-3" />
                            )}
                            {loading ? 'Launching Campaign...' : 'Blast Campaign Now'}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                   <div className="premium-card p-6 bg-dark text-white border-none shadow-xl">
                      <h3 className="text-lg font-black mb-4 flex items-center">
                         <Sparkles size={20} className="mr-2 text-yellow-400" /> Tips for Success
                      </h3>
                      <ul className="space-y-4 text-sm text-gray-400">
                         <li className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-primary mt-1 shrink-0" />
                            Use words like "Exclusive", "Limited Time", or "Tonight Only".
                         </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-primary mt-1 shrink-0" />
                            Keep the discount badge between 10% and 50% for maximum clicks.
                         </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-primary mt-1 shrink-0" />
                            Target specific deep links to hotels with many photos.
                         </li>
                      </ul>
                   </div>

                   <div className="premium-card p-6 border-none shadow-xl bg-primary/5">
                        <div className="text-xs text-primary/60 font-black mb-2 uppercase tracking-widest">Live Preview</div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/10">
                            <div className="w-full h-12 bg-gray-100 rounded mb-3"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                   </div>
                </div>
            </div>

            {/* Active Promotions List */}
            <div className="premium-card p-10 border-none shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-dark tracking-tight">Active Campaigns</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Manage live offers shown on landing page</p>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black">
                        {promotions.length} Live
                    </div>
                </div>

                {fetchingPromotions ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl space-y-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-gray-500 font-bold text-sm">Fetching your campaigns...</p>
                    </div>
                ) : promotions.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">No Active Campaigns</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">Create your first campaign above to see it listed here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {promotions.map((promo) => (
                            <div key={promo._id} className="group relative bg-gray-50 hover:bg-white p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-transparent hover:border-primary/10">
                                <div className="space-y-3 flex-grow">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-black text-dark tracking-tight">{promo.title}</h4>
                                        {promo.discount && (
                                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-primary/20">
                                                -{promo.discount}% OFF
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 italic">"{promo.message}"</p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                        {promo.hotelId?.name && (
                                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                                <Tag size={12} className="mr-1" /> {promo.hotelId.name}
                                            </div>
                                        )}
                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Calendar size={12} className="mr-1" /> Exp: {new Date(promo.expiresAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleDelete(promo._id)}
                                        className="p-4 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 bg-white shadow-sm border border-gray-100"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionsManagement;
