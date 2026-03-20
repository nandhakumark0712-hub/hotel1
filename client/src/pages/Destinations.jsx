import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import AdvancedSearchBar from '../components/common/AdvancedSearchBar';
import { ArrowLeft, MapPin, Star, SlidersHorizontal, X, Loader2, ChevronDown } from 'lucide-react';

const AMENITY_OPTIONS = ['WiFi', 'Pool', 'Parking', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Air Conditioning'];
const PRICE_RANGES = [
  { label: 'Under ₹2,000', value: '0-2000' },
  { label: '₹2,000 – ₹5,000', value: '2000-5000' },
  { label: '₹5,000 – ₹10,000', value: '5000-10000' },
  { label: '₹10,000+', value: '10000-999999' }
];

const Destinations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    amenities: [],
    checkIn: '',
    checkOut: '',
  });

  const cityFromUrl = searchParams.get('city') || '';

  // Watch URL params for initial city search
  useEffect(() => {
    if (cityFromUrl) {
      handleSearch(cityFromUrl);
    }
  }, [cityFromUrl]);

  const handleSearch = async (city) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('location', city);
      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.amenities.length) params.append('amenities', filters.amenities.join(','));
      if (filters.checkIn) params.append('checkIn', filters.checkIn);
      if (filters.checkOut) params.append('checkOut', filters.checkOut);
      params.append('limit', 20);

      const { data } = await API.get(`/api/search/hotels?${params.toString()}`);
      setHotels(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({ priceRange: '', rating: '', amenities: [], checkIn: '', checkOut: '' });
  };

  const activeFilterCount = [filters.priceRange, filters.rating, ...filters.amenities, filters.checkIn].filter(Boolean).length;

  const popularDestinations = [
    { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1570160230244-c77353d5f3f2' },
    { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31887846eac' },
    { city: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2' },
    { city: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5' },
    { city: 'Udaipur', img: 'https://images.unsplash.com/photo-1615412721110-388277be0255' },
    { city: 'Manali', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23' },
    { city: 'Varanasi', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc' },
    { city: 'Agra', img: 'https://images.unsplash.com/photo-1564507592208-01584ea68571' },
    { city: 'Munnar', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-primary font-bold transition-colors group mr-2 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:inline">Back</span>
          </button>

          <div className="flex-1 w-full">
            <AdvancedSearchBar />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all flex-shrink-0 ${
              activeFilterCount > 0
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-white py-4 px-4 animate-fade-in-up">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">Any Price</option>
                    {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Minimum Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+</option>
                    <option value="4">4.0+</option>
                    <option value="3.5">3.5+</option>
                  </select>
                </div>

                {/* Check-In */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-in</label>
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                {/* Check-Out */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-out</label>
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        filters.amenities.includes(a)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSearch(cityFromUrl)}
                  className="btn-primary py-2 px-6 text-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" /> Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && hotels.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-dark">
                {hotels.length} {hotels.length === 1 ? 'Hotel' : 'Hotels'} Found
                {cityFromUrl && <span className="text-primary"> in {cityFromUrl}</span>}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(hotel => (
                <div
                  key={hotel._id}
                  onClick={() => navigate(`/hotels/${hotel._id}`)}
                  className="premium-card overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-bold">{hotel.rating?.toFixed(1) || 'New'}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-dark text-lg mb-1 tracking-tight">{hotel.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1 text-primary" />
                      {hotel.location?.city}, {hotel.location?.state}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hotel.amenities?.slice(0, 3).map(a => (
                        <span key={a} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{a}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 text-xs">Starts from</span>
                        <div className="text-xl font-black text-primary">₹{hotel.startingPrice?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {!loading && hasSearched && hotels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <MapPin className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold mb-2">No hotels found</h3>
            <p className="text-sm text-gray-400">Try adjusting your filters or searching for a different city.</p>
          </div>
        )}

        {/* Empty state: show popular destinations */}
        {!loading && !hasSearched && (
          <div>
            <div className="mb-10">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Explore</span>
              <h1 className="text-4xl font-black text-dark mt-2 tracking-tight">Popular Destinations in India</h1>
              <p className="text-gray-500 mt-3 text-base max-w-xl">Search above or tap a destination below to find available hotels.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularDestinations.map((item) => (
                <div
                  key={item.city}
                  onClick={() => {
                    setSearchParams({ city: item.city });
                    handleSearch(item.city);
                  }}
                  className="premium-card overflow-hidden group cursor-pointer h-64 relative shadow-md hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img
                    src={`${item.img}?auto=format&fit=crop&q=80&w=600`}
                    alt={item.city}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-5 left-6 z-20">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest block">Trending</span>
                    <h3 className="text-2xl font-black text-white tracking-tight">{item.city}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
