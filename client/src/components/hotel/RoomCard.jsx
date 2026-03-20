import React from 'react';
import { Check, Users, Wifi, Coffee, Wind } from 'lucide-react';

const RoomCard = ({ room, onSelect }) => {
  return (
    <div className="premium-card p-6 flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden shrink-0">
        <img 
          src={room.images?.[0] || 'https://placehold.co/400x300?text=No+Room+Image'} 
          alt={room.roomType}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-dark">{room.roomType}</h3>
            <div className="flex items-center text-gray-500 mt-1">
              <Users className="w-4 h-4 mr-1" />
              <span>Up to {room.capacity} Guests</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary">₹{room.price}</span>
            <span className="text-gray-400 text-sm block">per night</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Wifi className="w-4 h-4 mr-2 text-green-500" />
            Free WiFi
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Coffee className="w-4 h-4 mr-2 text-green-500" />
            Breakfast included
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Wind className="w-4 h-4 mr-2 text-green-500" />
            Air Conditioning
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            Free Cancellation
          </div>
        </div>

        <button 
          onClick={() => onSelect(room)}
          className="w-full md:w-auto btn-primary px-12"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
