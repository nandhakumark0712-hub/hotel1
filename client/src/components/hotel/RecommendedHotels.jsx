import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import HotelCard from './HotelCard';
import { Sparkles } from 'lucide-react';

const RecommendedHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const { data } = await API.get('/api/hotels/recommended?limit=4');
                
                if (data.success) {
                    setHotels(data.data);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) return null; // Or a skeleton loader
    if (!hotels || hotels.length === 0) return null;

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-dark tracking-tight">Recommended For You</h2>
                        <p className="text-gray-500 font-medium mt-1">Based on your preferences and popular choices</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel._id} hotel={hotel} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecommendedHotels;
