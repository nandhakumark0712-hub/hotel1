import { Check, Users, Wifi, Coffee, Wind } from 'lucide-react';
import { resolveImageUrl } from '../../utils/urlHelper';

const RoomCard = ({ room, onSelect }) => {
  return (
    <div className="premium-card p-6 flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden shrink-0">
        <img 
          src={resolveImageUrl(room.images?.[0]) || 'https://placehold.co/400x300?text=No+Room+Image'} 
          alt={room.roomType}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-dark tracking-tight">{room.roomType}</h3>
            <div className="flex items-center text-gray-400 mt-2 font-bold text-xs uppercase tracking-widest">
              <Users className="w-4 h-4 mr-2" />
              <span>Up to {room.capacity} Guests</span>
            </div>
          </div>
          <div className="text-left sm:text-right bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
            <span className="text-2xl md:text-3xl font-black text-primary">₹{room.price}</span>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-tighter block">per night</span>
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
