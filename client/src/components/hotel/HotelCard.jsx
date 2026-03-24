import React from 'react';
import { Mail, Phone, MapPin, Star, Wifi, Coffee, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/urlHelper';

const HotelCard = ({ hotel }) => {
  return (
    <div className="premium-card group overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={resolveImageUrl(hotel?.images?.[0]) || 'https://placehold.co/800x600?text=No+Hotel+Image'} 
          alt={hotel?.name || 'Hotel'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-sm z-10">
          <Star className="w-4 h-4 text-accent fill-accent mr-1" />
          <span className="text-sm font-bold">{hotel.rating}</span>
        </div>
        {hotel.promotion?.isActive && (
          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-lg z-10 flex items-center">
            <span className="animate-pulse mr-1">🔥</span> {hotel.promotion.discount}% OFF
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-dark tracking-tight">{hotel.name}</h3>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{hotel.location?.city || 'City'}, {hotel.location?.address || 'Address'}</span>
        </div>

        <div className="flex space-x-3 mb-6">
          {hotel?.amenities?.slice(0, 3).map((amenity, idx) => (
             <div key={idx} className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
               {amenity}
             </div>
          ))}
          {hotel?.amenities?.length > 3 && (
            <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              +{hotel.amenities.length - 3} more
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-gray-100 gap-4">
          <div>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Price starts from</span>
            <div className="text-2xl md:text-3xl font-black text-primary leading-none">₹{hotel?.rooms?.length > 0 ? Math.min(...hotel.rooms.map(r => r.price)) : 'N/A'}</div>
          </div>
          <Link to={`/hotels/${hotel?._id}`} className="w-full sm:w-auto btn-primary !py-3 !px-6 text-sm tracking-widest">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
