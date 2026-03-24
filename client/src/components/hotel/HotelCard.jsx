import React from 'react';
import { Mail, Phone, MapPin, Star, Wifi, Coffee, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/urlHelper';

const HotelCard = ({ hotel }) => {
  return (
    <div className="premium-card group overflow-hidden">
      <div className="relative h-64 md:h-72 w-full overflow-hidden bg-gray-100">
        <img 
          src={resolveImageUrl(hotel?.images?.[0]) || 'https://placehold.co/800x600?text=No+Hotel+Image'} 
          alt={hotel?.name || 'Hotel'}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-1000 ease-out"
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

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-gray-400 text-sm">Starts from</span>
            <div className="text-2xl font-bold text-primary">₹{hotel?.rooms?.length > 0 ? Math.min(...hotel.rooms.map(r => r.price)) : 'N/A'}</div>
          </div>
          <Link to={`/hotels/${hotel?._id}`} className="btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
