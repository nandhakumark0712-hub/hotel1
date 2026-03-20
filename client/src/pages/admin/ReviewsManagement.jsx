import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, Star, Trash2, Search, Quote, Hotel, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await API.get('/api/admin/reviews');
            setReviews(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this review?')) return;
        try {
            await API.delete(`/api/admin/reviews/${id}`);
            toast.success('Review removed successfully');
            setReviews(reviews.filter(r => r._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove review');
        }
    };

    const filteredReviews = reviews.filter(r => 
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hotelId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-dark tracking-tight">Reviews & Reputation</h1>
                    <p className="text-gray-500 mt-1">Monitor guest feedback and moderate inappropriate content.</p>
                </div>
                <div className="flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-2xl border border-yellow-100 font-bold text-sm">
                    <Star size={16} className="fill-yellow-500 text-yellow-500 mr-2" />
                    Total Reviews: {reviews.length}
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search comments, reviewers or hotel names..."
                    className="w-full pl-16 pr-6 py-4 bg-white border-2 border-transparent rounded-[2.5rem] shadow-sm outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredReviews.map((review) => (
                    <div key={review._id} className="premium-card p-8 flex flex-col relative group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500">
                        {/* Quote icon background decoration */}
                        <Quote size={80} className="absolute -top-4 -right-4 text-gray-50/50 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={18} 
                                        className={`${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} transition-colors duration-300`} 
                                    />
                                ))}
                            </div>
                            <button 
                                onClick={() => handleDelete(review._id)}
                                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="flex-1 mb-8 relative z-10">
                            <p className="text-gray-700 text-lg font-medium italic leading-relaxed">
                                "{review.comment}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 relative z-10">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2 flex items-center">
                                    <User size={12} className="mr-1" /> Guest Details
                                </div>
                                <div className="font-bold text-dark">{review.userId?.name}</div>
                                <div className="text-xs text-gray-500 truncate">{review.userId?.email}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2 flex items-center">
                                    <Hotel size={12} className="mr-1" /> Property
                                </div>
                                <div className="font-bold text-primary truncate">{review.hotelId?.name}</div>
                                <div className="text-[10px] text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReviews.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                        <Quote size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-400">No reviews to display</h3>
                    <p className="text-gray-300">Try adjusting your search criteria</p>
                </div>
            )}
        </div>
    );
};

export default ReviewsManagement;
