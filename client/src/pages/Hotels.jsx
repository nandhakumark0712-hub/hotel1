import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { fetchHotels } from '../redux/slices/hotelSlice';
import HotelCard from '../components/hotel/HotelCard';
import { Loader2, Search, Filter, SlidersHorizontal, Calendar, X } from 'lucide-react';
import LocationSearch from '../components/hotel/LocationSearch';
import GuestPicker from '../components/common/GuestPicker';
import { Users } from 'lucide-react';

const Hotels = () => {
  const dispatch = useDispatch();
  const { hotels, isLoading, isError, message } = useSelector((state) => state.hotels);
  
  const location = useLocation();
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      city: params.get('city') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      minRating: params.get('minRating') || '',
      amenities: params.get('amenities') ? params.get('amenities').split(',') : [],
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      guests: params.get('guests') || '2 Adults, 1 Room'
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    if (params.get('city')) newFilters.city = params.get('city');
    if (params.get('checkIn')) newFilters.checkIn = params.get('checkIn');
    if (params.get('checkOut')) newFilters.checkOut = params.get('checkOut');
    if (params.get('guests')) newFilters.guests = params.get('guests');
    setFilters(newFilters);
  }, [location.search]);

  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [filters, dispatch]);

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const amenitiesList = [
    'WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'AC', 'Parking', 'TV',
    'Room Service', 'Coffee Shop', 'Fitness Center', 'Massage'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Mobile Header / Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark">Explore Hotels</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Sidebar Controls */}
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:relative lg:bg-transparent lg:inset-auto lg:z-0 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
          <div className={`w-80 h-full bg-white lg:bg-transparent lg:h-auto overflow-y-auto p-8 lg:p-0 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <h3 className="text-2xl font-bold">Filters</h3>
              <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-10 sticky top-24">
              {/* Search */}
              <div className="premium-card p-6 bg-white border border-gray-100">
                <h4 className="font-bold mb-4 text-dark flex items-center">
                  <Search className="w-4 h-4 mr-2 text-primary" />
                  Destination
                </h4>
                <LocationSearch 
                  value={filters.city}
                  onChange={(city) => setFilters({...filters, city})}
                  onSelect={(selected) => setFilters({...filters, city: selected.name})}
                  placeholder="Where are you going?"
                />
              </div>

              {/* Price Range */}
              <div className="premium-card p-6 bg-white border border-gray-100">
                <h4 className="font-bold mb-4 text-dark flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-primary" />
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none bg-gray-50"
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none bg-gray-50"
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="premium-card p-6 bg-white border border-gray-100">
                <h4 className="font-bold mb-4 text-dark flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Dates
                </h4>
                <div className="space-y-4">
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none bg-gray-50"
                    onChange={(e) => setFilters({...filters, checkIn: e.target.value})}
                  />
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none bg-gray-50 text-sm font-semibold"
                    value={filters.checkOut}
                    onChange={(e) => setFilters({...filters, checkOut: e.target.value})}
                  />
                </div>
              </div>
 
              {/* Guests Selector */}
              <div className="premium-card p-6 bg-white border border-gray-100">
                <h4 className="font-bold mb-4 text-dark flex items-center">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  Travelers
                </h4>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-2 relative">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest absolute top-2 right-4">Manage</span>
                  <GuestPicker 
                    value={filters.guests}
                    onChange={(val) => setFilters({...filters, guests: val})}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="premium-card p-6 bg-white border border-gray-100">
                <h4 className="font-bold mb-4 text-dark">Amenities</h4>
                <div className="grid grid-cols-2 gap-y-3">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.amenities.includes(amenity) ? 'bg-primary border-primary' : 'border-gray-200 group-hover:border-primary'}`}>
                        {filters.amenities.includes(amenity) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-dark">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button 
                onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', minRating: '', amenities: [], checkIn: '', checkOut: '', guests: '2 Adults, 1 Room' })}
                className="w-full text-center text-sm font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="flex-grow">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="hidden lg:block text-4xl font-bold text-dark tracking-tight">Hotels in {filters.city || 'all destinations'}</h1>
              <p className="text-gray-500 mt-2">{hotels.length} results found matching your search</p>
            </div>
            <div className="hidden lg:block">
               <select className="bg-white border-gray-200 rounded-xl px-4 py-2 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer">
                 <option>Sort by: Popularity</option>
                 <option>Price: Low to High</option>
                 <option>Rating: High to Low</option>
               </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-gray-400 font-medium">Finding the best deals for you...</p>
            </div>
          ) : isError ? (
            <div className="bg-red-50 p-8 rounded-3xl text-center text-red-600 border border-red-100">
              {message}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-6">🏝️</div>
              <h3 className="text-2xl font-bold text-dark mb-4">No hotels found</h3>
              <p className="text-gray-500 max-w-md mx-auto">Try adjusting your filters or destination to see more results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hotels;
