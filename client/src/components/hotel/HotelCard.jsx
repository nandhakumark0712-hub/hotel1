import React from 'react';
import { Mail, Phone, MapPin, Star, Wifi, Coffee, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/urlHelper';

const HotelCard = ({ hotel }) => {
  return (
    <div className="premium-card flex flex-col h-full group overflow-hidden border-2 border-primary/5 hover:border-primary/20 transition-all duration-500">
      <div className="relative h-64 md:h-72 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        <img 
          src={resolveImageUrl(hotel?.images?.[0]) || 'https://placehold.co/800x600?text=No+Hotel+Image'} 
          alt={hotel?.name || 'Hotel'}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-6 right-6 z-20">
           <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center shadow-xl border border-white/20">
              <Star className="w-4 h-4 text-accent fill-accent mr-1.5" />
              <span className="text-sm font-bold text-dark">{hotel.rating || 0}</span>
           </div>
        </div>

        {/* Promo Badge */}
        {hotel.promotion?.isActive && (
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-primary text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.15em] uppercase shadow-2xl shadow-primary/40 flex items-center border border-white/20">
              <span className="animate-pulse mr-2 text-base leading-none">🔥</span> {hotel.promotion.discount}% OFF
            </div>
          </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-auto">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-black text-dark tracking-tight leading-tight group-hover:text-primary transition-colors">{hotel.name}</h3>
          </div>
          
          <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span className="line-clamp-1">{hotel.location?.city || 'City'}, {hotel.location?.address || 'Address'}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {hotel?.amenities?.slice(0, 3).map((amenity, idx) => (
               <div key={idx} className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                 {amenity}
               </div>
            ))}
            {hotel?.amenities?.length > 3 && (
              <div className="flex items-center text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                +{hotel.amenities.length - 3} more
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-6">
          <div className="text-center sm:text-left">
            <span className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Stay from</span>
            <div className="text-3xl font-black text-dark tracking-tighter">
               <span className="text-primary">₹</span>{hotel?.rooms?.length > 0 ? Math.min(...hotel.rooms.map(r => r.price)) : '---'}
               <span className="text-xs text-gray-300 font-bold tracking-normal ml-1">/ night</span>
            </div>
          </div>
          <Link to={`/hotels/${hotel?._id}`} className="w-full sm:w-auto btn-primary shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
