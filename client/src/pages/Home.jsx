import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, FileText, Phone, Megaphone, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import LocationSearch from '../components/hotel/LocationSearch';
import RecommendedHotels from '../components/hotel/RecommendedHotels';
import AdvancedSearchBar from '../components/common/AdvancedSearchBar';

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
      <section className="relative min-h-[500px] md:h-[650px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Resort" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto -mt-10 md:-mt-20">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            Experience Your <span className="text-secondary tracking-tight">Dream</span> Vacation
          </h1>
          <p className="text-base md:text-xl text-white/90 mb-10 md:mb-16 max-w-2xl mx-auto font-medium drop-shadow-md">
            Unlock exclusive stays at world-class hotels with our premium booking experience.
          </p>

          {/* New Search Template */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl md:rounded-[2rem] p-4 md:p-8 shadow-2xl grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-4 items-stretch border border-white/20 backdrop-blur-sm">
              
              {/* Where to */}
              <div 
                className="col-span-1 sm:col-span-2 md:flex-[2] search-field-container text-left cursor-text"
                onClick={() => document.getElementById('location-input')?.focus()}
              >
                <span className="search-field-label">Where to</span>
                <LocationSearch 
                  id="location-input"
                  value={searchData.city}
                  onChange={(city) => setSearchData({...searchData, city})}
                  placeholder="e.g. - Area, Landmark or Property Name"
                  unstyled={true}
                />
              </div>

              {/* Check-in */}
              <div className="search-field-container text-left group cursor-pointer relative">
                <span className="search-field-label">Check-in</span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-dark">{formatDate(searchData.checkIn)}</span>
                  <span className="text-xs text-gray-400 font-semibold">{getDayName(searchData.checkIn) || 'Select Day'}</span>
                </div>
                <input 
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  onClick={(e) => e.target.showPicker?.()}
                  onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                />
              </div>

              {/* Check-out */}
              <div className="search-field-container text-left group cursor-pointer relative">
                <span className="search-field-label">Check-out</span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-dark">{formatDate(searchData.checkOut)}</span>
                  <span className="text-xs text-gray-400 font-semibold">{getDayName(searchData.checkOut) || 'Select Day'}</span>
                </div>
                <input 
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  onClick={(e) => e.target.showPicker?.()}
                  onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                />
              </div>

              {/* Guests */}
              <div className="search-field-container text-left group cursor-pointer relative col-span-1 sm:col-span-2 md:flex-1">
                <span className="search-field-label">Guests & Rooms</span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-dark truncate leading-tight mt-1">{searchData.guests}</span>
                </div>
                <select 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={searchData.guests}
                  onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                >
                  <option value="1 Adult, 1 Room">1 Adult, 1 Room</option>
                  <option value="2 Adults, 1 Room">2 Adults, 1 Room</option>
                  <option value="2 Adults, 2 Rooms">2 Adults, 2 Rooms</option>
                  <option value="4 Adults, 2 Rooms">4 Adults, 2 Rooms</option>
                </select>
              </div>
            </div>

            {/* Centered Search Button */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30">
              <button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary-dark text-white px-16 py-5 rounded-full font-black text-xl tracking-widest shadow-[0_10px_30px_rgba(255,90,54,0.4)] transition-all hover:scale-105 active:scale-95 uppercase"
              >
                Search
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
