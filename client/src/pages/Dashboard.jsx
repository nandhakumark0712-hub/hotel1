import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Loader2, Calendar, MapPin, Clock, CheckCircle, XCircle, Edit2, AlertTriangle, ArrowRight, User, Mail, Search } from 'lucide-react';
import LocationSearch from '../components/hotel/LocationSearch';
import RecommendedHotels from '../components/hotel/RecommendedHotels';
import { resolveImageUrl } from '../utils/urlHelper';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchData, setSearchData] = useState({ city: '', checkIn: '', checkOut: '' });
  const [newDates, setNewDates] = useState({ checkIn: '', checkOut: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

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

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/api/bookings/my-bookings');
      setBookings(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      if (selectedBooking.paymentStatus === 'Paid') {
        await API.post(`/api/payments/refund/${selectedBooking._id}`);
        alert('Booking cancelled and refund processed successfully');
      } else {
        await API.put(`/api/bookings/${selectedBooking._id}/cancel`);
        alert('Booking cancelled successfully');
      }
      fetchBookings();
      setIsCancelModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!newDates.checkIn || !newDates.checkOut) return;
    setActionLoading(true);
    try {
      await API.put(`/api/bookings/${selectedBooking._id}`, newDates);
      alert('Booking updated successfully');
      fetchBookings();
      setIsEditModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Manage your bookings and explore new destinations.</p>
      </div>

      <div className="premium-card p-6 md:p-10 mb-8 md:mb-12 bg-white border border-gray-100 shadow-xl shadow-primary/5 relative">
        <h2 className="text-xl md:text-2xl font-bold text-dark mb-6 md:mb-8">Find Your Next Stay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          
          {/* Where to */}
          <div 
            className="sm:col-span-2 lg:col-span-1 search-field-container text-left bg-gray-50/50 cursor-text group"
            onClick={() => document.getElementById('dashboard-location-input')?.focus()}
          >
            <span className="search-field-label">Where to</span>
            <LocationSearch 
              id="dashboard-location-input"
              value={searchData.city}
              onChange={(city) => setSearchData({...searchData, city})}
              placeholder="Area or City"
              unstyled={true}
            />
          </div>

          {/* Check-in */}
          <div className="search-field-container text-left group cursor-pointer relative bg-gray-50/50">
            <span className="search-field-label">Check-in</span>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-dark">{formatDate(searchData.checkIn)}</span>
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
          <div className="search-field-container text-left group cursor-pointer relative bg-gray-50/50">
            <span className="search-field-label">Check-out</span>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-dark">{formatDate(searchData.checkOut)}</span>
              <span className="text-xs text-gray-400 font-semibold">{getDayName(searchData.checkOut) || 'Select Day'}</span>
            </div>
            <input 
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSearch}
            className="btn-primary py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 sm:col-span-2 lg:col-span-1"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Your Bookings</h2>
          {bookings.length === 0 ? (
            <div className="premium-card p-12 text-center text-gray-400 border-2 border-dashed">
              No bookings found. Start exploring hotels!
              <div className="mt-6">
                <Link to="/hotels" className="btn-primary">Browse Hotels</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="premium-card p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center border-2 border-primary/5 hover:border-primary/20 transition-all duration-300">
                  <div className="w-full md:w-48 h-56 md:h-48 rounded-[2rem] overflow-hidden shrink-0 shadow-2xl relative group/img">
                    <img 
                      src={resolveImageUrl(booking.hotelId.images?.[0])} 
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                      alt={booking.hotelId.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-6">
                       <span className="text-white text-xs font-black uppercase tracking-widest">View Details</span>
                    </div>
                  </div>
                  <div className="flex-grow w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-dark">{booking.hotelId.name}</h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{booking.hotelId.location.city}</span>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {booking.bookingStatus}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6 pb-6 border-b">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                         <span className="font-medium">{booking.roomId.roomType}</span>
                      </div>
                      <div className="flex items-center font-bold text-primary text-lg">
                        <span>₹{booking.totalPrice}</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {booking.bookingStatus !== 'Cancelled' && (
                        <>
                          <button 
                            onClick={() => { setSelectedBooking(booking); setIsEditModalOpen(true); setNewDates({ checkIn: booking.checkIn.split('T')[0], checkOut: booking.checkOut.split('T')[0] }); }}
                            className="flex items-center text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Modify
                          </button>
                          <button 
                            onClick={() => { setSelectedBooking(booking); setIsCancelModalOpen(true); }}
                            className="flex items-center text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="premium-card p-10 bg-dark text-white shadow-xl shadow-primary/10">
            <h3 className="text-xl font-bold mb-8">Personal Details</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-white/10 p-3 rounded-2xl mr-4">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase font-bold tracking-widest">Full Name</div>
                  <div className="text-lg font-semibold">{user?.name}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-white/10 p-3 rounded-2xl mr-4">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase font-bold tracking-widest">Email Address</div>
                  <div className="text-lg font-semibold truncate w-48">{user?.email}</div>
                </div>
              </div>
            </div>
            <button className="w-full bg-white text-dark py-4 rounded-2xl mt-12 font-bold hover:bg-gray-100 transition-colors">
              Edit Account
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Hotels for Logged In User */}
      <div className="mt-12">
        <RecommendedHotels />
      </div>

      {/* Cancel Modal */}

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full animate-fade-in-up">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">Cancel Reservation?</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to cancel your stay at **{selectedBooking.hotelId.name}**? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50"
              >
                No, Keep it
              </button>
              <button 
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full animate-fade-in-up">
            <h2 className="text-2xl font-bold text-dark mb-2">Modify Stay</h2>
            <p className="text-gray-500 mb-8">Update your check-in and check-out dates.</p>
            
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Check-in</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary"
                  value={newDates.checkIn}
                  onChange={(e) => setNewDates({...newDates, checkIn: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Check-out</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary"
                  value={newDates.checkOut}
                  onChange={(e) => setNewDates({...newDates, checkOut: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50"
              >
                Go Back
              </button>
              <button 
                onClick={handleUpdate}
                disabled={actionLoading}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
