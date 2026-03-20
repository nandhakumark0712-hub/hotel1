import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Loader2, Calendar, User, CreditCard, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

const ManagerBookings = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, bookingsRes] = await Promise.all([
          API.get(`/api/hotels/${hotelId}`),
          API.get(`/api/bookings/hotel/${hotelId}`)
        ]);
        setHotel(hotelRes.data.data);
        setBookings(bookingsRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/api/bookings/${id}`, { bookingStatus: status });
      setBookings(bookings.map(b => b._id === id ? { ...b, bookingStatus: status } : b));
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating booking status');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <img 
            src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a850601f010?w=100'} 
            className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" 
            alt={hotel?.name} 
          />
          <div>
            <h1 className="text-3xl font-bold text-dark mb-1">Reservations: {hotel?.name}</h1>
            <div className="flex items-center text-gray-400 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-1 text-primary" />
              {hotel?.location?.city}, {hotel?.location?.address}
            </div>
          </div>
        </div>
        <p className="text-gray-500 max-w-xs text-right hidden md:block italic">Track and manage guest bookings for this property.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="premium-card p-12 text-center text-gray-500 italic">
          No bookings found for this hotel yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="premium-card p-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col md:flex-row gap-8 items-center flex-grow">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl uppercase">
                  {booking.userId?.name?.charAt(0) || '?'}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-dark">{booking.userId?.name || 'Guest Details Unavailable'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-600' :
                      booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {booking.roomId?.roomType || 'Room Type'} Room
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2 min-w-[150px]">
                <div className="text-2xl font-bold text-dark">₹{booking.totalPrice}</div>
                <div className={`text-sm flex items-center justify-end ${booking.paymentStatus === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>
                   {booking.paymentStatus === 'Paid' ? <CheckCircle className="w-4 h-4 mr-1"/> : <Clock className="w-4 h-4 mr-1"/>}
                   {booking.paymentStatus}
                </div>
              </div>

              <div className="flex gap-3">
                {booking.bookingStatus === 'Pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(booking._id, 'Confirmed')}
                      className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm shadow-green-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => updateStatus(booking._id, 'Cancelled')}
                      className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerBookings;
