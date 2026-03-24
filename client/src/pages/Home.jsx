import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, FileText, Phone, Megaphone, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import LocationSearch from '../components/hotel/LocationSearch';
import RecommendedHotels from '../components/hotel/RecommendedHotels';
import AdvancedSearchBar from '../components/common/AdvancedSearchBar';
import GuestPicker from '../components/common/GuestPicker';

const Home = () => {
  const [searchData, setSearchData] = useState({ city: '', checkIn: '', checkOut: '', guests: '2 Adults, 1 Room' });
  const [promotions, setPromotions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data } = await API.get('/api/hotels/promotions/active');
        if (data.success) {
          setPromotions(data.data);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    };
    fetchPromotions();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchData.city) queryParams.append('city', searchData.city);
    if (searchData.checkIn) queryParams.append('checkIn', searchData.checkIn);
    if (searchData.checkOut) queryParams.append('checkOut', searchData.checkOut);
    if (searchData.guests) queryParams.append('guests', searchData.guests);
    navigate(`/hotels?${queryParams.toString()}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[550px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Resort" 
          className="absolute inset-0 w-full h-full object-cover scale-110 object-center"
        />
        
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto -mt-16 md:-mt-32">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 md:mb-10 tracking-[ -0.05em] leading-[0.9] drop-shadow-2xl">
            Luxury Stays, <span className="text-secondary">Evolved.</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 mb-12 md:mb-20 max-w-2xl mx-auto font-medium drop-shadow-lg hidden sm:block">
            Elevate your travel experience with handpicked premium hotels & effortless bookings.
          </p>

          {/* Search Box */}
          <div className="relative max-w-5xl mx-auto w-full group">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.3)] grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-4 md:gap-6 items-stretch border border-white/20 transition-all duration-500 group-hover:shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
              
              {/* Where to */}
              <div 
                className="col-span-1 sm:col-span-2 md:flex-[2.5] search-field-container text-left cursor-text bg-gray-50/50"
                onClick={() => document.getElementById('location-input')?.focus()}
              >
                <span className="search-field-label">Destination</span>
                <LocationSearch 
                  id="location-input"
                  value={searchData.city}
                  onChange={(city) => setSearchData({...searchData, city})}
                  placeholder="Where to?"
                  unstyled={true}
                />
              </div>

              {/* Check-in/out combined row on small mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:flex md:flex-[2.5] gap-4 w-full">
                {/* Check-in */}
                <div className="search-field-container text-left group cursor-pointer relative bg-gray-50/50 flex-1">
                  <span className="search-field-label">Check-in</span>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-bold text-dark">{formatDate(searchData.checkIn)}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">{getDayName(searchData.checkIn) || 'Day'}</span>
                  </div>
                  <input 
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onClick={(e) => e.target.showPicker?.()}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                  />
                </div>

                {/* Check-out */}
                <div className="search-field-container text-left group cursor-pointer relative bg-gray-50/50 flex-1">
                  <span className="search-field-label">Check-out</span>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-bold text-dark">{formatDate(searchData.checkOut)}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">{getDayName(searchData.checkOut) || 'Day'}</span>
                  </div>
                  <input 
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onClick={(e) => e.target.showPicker?.()}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="search-field-container text-left group cursor-pointer col-span-1 sm:col-span-2 md:flex-[2] relative bg-gray-50/50">
                <span className="search-field-label">Guests</span>
                <GuestPicker 
                  value={searchData.guests}
                  onChange={(val) => setSearchData({...searchData, guests: val})}
                />
              </div>
            </div>

            {/* Smart Search Button */}
            <div className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-xs px-6">
              <button 
                onClick={handleSearch}
                className="w-full bg-primary hover:bg-primary-dark text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl tracking-[0.2em] shadow-[0_20px_50px_rgba(255,90,54,0.4)] transition-all hover:scale-105 active:scale-95 uppercase flex items-center justify-center gap-3 group/btn"
              >
                Start Search <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers Section */}
      {promotions.length > 0 && (
        <section className="pt-24 pb-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
               <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Megaphone size={24} /></div>
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tight">Exclusive Offers</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Hand-picked deals and seasonal specials</p>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.map(promo => (
                <div key={promo._id} className="premium-card p-10 bg-dark text-white border-none shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  {promo.discount && (
                    <div className="mb-6 inline-flex items-center px-4 py-2 bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-widest">
                       <Sparkles size={14} className="mr-2" /> {promo.discount}% Guaranteed Discount
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    {promo.hotelId?.name && (
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">{promo.hotelId.name}</p>
                    )}
                    <h3 className="text-2xl font-black mb-4 tracking-tight">{promo.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-10 leading-relaxed relative z-10 line-clamp-3">
                    {promo.message}
                  </p>
                  
                  <div className="flex items-center justify-between relative z-10 mt-auto pt-6 border-t border-white/10">
                    <button 
                      onClick={() => {
                        const targetId = promo.hotelId?._id || promo.hotelId;
                        if (targetId) {
                          navigate(`/hotels/${targetId}`);
                        } else {
                          navigate('/hotels');
                        }
                      }}
                      className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-[0.2em] hover:text-primary transition-colors group/link"
                    >
                      Book This Offer <ArrowRight size={14} className="group-hover/link:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Hotels Section */}
      <RecommendedHotels />

      {/* Popular Destinations Section */}

      <section className="py-16 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Exploration</span>
            <h2 className="text-3xl md:text-4xl font-black text-dark mt-2 tracking-tight">Popular Destinations</h2>
          </div>
          <button 
            onClick={() => navigate('/destinations')}
            className="text-gray-400 font-bold flex items-center hover:text-primary transition-colors"
          >
            View All <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { city: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2' },
            { city: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5' },
            { city: 'Manali', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23' },
            { city: 'Munnar', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944' }
          ].map((item) => (
            <div 
              key={item.city} 
              onClick={() => navigate(`/hotels?city=${item.city}`)}
              className="premium-card overflow-hidden group cursor-pointer h-64 md:h-80 relative shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              <img 
                src={`${item.img}?auto=format&fit=crop&q=80&w=600`} 
                alt={item.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-8 z-20">
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 block">Trending</span>
                <h3 className="text-3xl font-black text-white tracking-tight">{item.city}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">Privacy Policy</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                We prioritize your safety. All your personal data and payment information is protected using industry-standard 256-bit SSL encryption.
              </p>
              <button onClick={() => navigate('/privacy')} className="mt-4 text-primary font-bold text-sm hover:underline">Read More</button>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">Terms of Service</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Our terms are transparent and fair. We ensure clear booking policies, flexible cancellations, and secure transactions for all guests.
              </p>
              <button onClick={() => navigate('/terms')} className="mt-4 text-primary font-bold text-sm hover:underline">Read More</button>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">24/7 Support</h3>
              <div className="text-gray-500 leading-relaxed text-sm">
                <p className="mb-2">Need help with your booking? Our dedicated team is just a call or message away.</p>
                <p className="font-bold text-dark text-base">+91 7603883212</p>
                <p className="font-medium text-primary">nkhotelb@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
