import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Loader2, Calendar, CreditCard, ArrowRight, ShieldCheck, Info } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const roomId = searchParams.get('roomId');
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availability, setAvailability] = useState({ checked: false, available: false, unitsRemaining: 0 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pay-at-hotel');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          API.get(`/api/hotels/${hotelId}`),
          API.get(`/api/rooms/${hotelId}`)
        ]);
        setHotel(hotelRes.data.data);
        const selectedRoom = roomsRes.data.data.find(r => r._id === roomId);
        setRoom(selectedRoom);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (hotelId && roomId) fetchData();
  }, [hotelId, roomId]);

  useEffect(() => {
    if (checkIn && checkOut && roomId) {
      const checkRoomAvailability = async () => {
        setCheckingAvailability(true);
        try {
          const { data } = await API.get(`/api/bookings/check-availability`, {
            params: { roomId, checkIn, checkOut }
          });
          setAvailability({ checked: true, available: data.available, unitsRemaining: data.unitsRemaining });
        } catch (error) {
          console.error(error);
        } finally {
          setCheckingAvailability(false);
        }
      };
      checkRoomAvailability();
    } else {
      setAvailability({ checked: false, available: false, unitsRemaining: 0 });
    }
  }, [checkIn, checkOut, roomId]);

  const handleBooking = async () => {
    if (!checkIn || !checkOut) return alert('Please select dates');
    if (!availability.available) return alert('Room is not available for these dates');
    
    setBookingLoading(true);
    try {
      const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
      if (days <= 0) return alert('Check-out must be after check-in');

      const { data: bookingData } = await API.post('/api/bookings', {
        hotelId,
        roomId,
        checkIn,
        checkOut,
        totalPrice: Math.round(room.price * days * 1.1), // Total with fees
        paymentMethod
      });
      
      if (paymentMethod === 'stripe') {
        const { data: paymentData } = await API.post('/api/payments/create-checkout-session', {
          bookingId: bookingData.data._id
        });
        if (paymentData.url) window.location.href = paymentData.url;
        else alert('Payment initialization failed');
      } else if (paymentMethod === 'razorpay') {
        navigate(`/payment-success?type=razorpay&bookingId=${bookingData.data._id}`);
      } else {
        alert('Booking received! You have selected Pay At Hotel. Reservation is pending.');
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  const days = checkIn && checkOut ? Math.max(0, (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 tracking-tight text-dark">Complete Your Booking</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="premium-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Calendar className="w-6 h-6 text-primary mr-2" />
                Select Dates
              </h3>
              {checkingAvailability && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input 
                  type="date" 
                  min={today}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <input 
                  type="date" 
                  min={checkIn || today}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {availability.checked && (
              <div className={`mt-6 p-4 rounded-xl flex items-center ${availability.available ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <Info className="w-5 h-5 mr-3" />
                <span className="font-medium">
                  {availability.available 
                    ? `Excellent choice! ${availability.unitsRemaining} ${room.type} rooms still available.` 
                    : `Sorry, this room is fully booked for the selected dates.`}
                </span>
              </div>
            )}
          </div>

          <div className="premium-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <CreditCard className="w-6 h-6 text-primary mr-2" />
              Payment Method
            </h3>
            <div className="space-y-4">
              <div 
                onClick={() => setPaymentMethod('pay-at-hotel')}
                className={`p-4 border-2 flex items-center justify-between cursor-pointer rounded-2xl transition-all ${paymentMethod === 'pay-at-hotel' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${paymentMethod === 'pay-at-hotel' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold">Pay At Hotel</div>
                    <div className="text-sm text-gray-500">Secure booking, no immediate payment</div>
                  </div>
                </div>
                {paymentMethod === 'pay-at-hotel' && <ShieldCheck className="w-6 h-6 text-primary" />}
              </div>

              <div 
                onClick={() => setPaymentMethod('stripe')}
                className={`p-4 border-2 flex flex-col cursor-pointer rounded-2xl transition-all ${paymentMethod === 'stripe' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${paymentMethod === 'stripe' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold">Credit / Debit Card (Stripe)</div>
                      <div className="text-sm text-gray-500">Powered securely by Stripe</div>
                    </div>
                  </div>
                  {paymentMethod === 'stripe' && <ShieldCheck className="w-6 h-6 text-indigo-600" />}
                </div>
                
                {paymentMethod === 'stripe' && (
                  <div className="mt-4 pt-4 border-t border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Card Number" 
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-600"
                        maxLength="19"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-600"
                        maxLength="5"
                      />
                      <input 
                        type="password" 
                        placeholder="CVC" 
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-600"
                        maxLength="3"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div 
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 border-2 flex items-center justify-between cursor-pointer rounded-2xl transition-all ${paymentMethod === 'razorpay' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${paymentMethod === 'razorpay' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold">UPI / Net Banking (Razorpay)</div>
                    <div className="text-sm text-gray-500">Fast and secure local payments</div>
                  </div>
                </div>
                {paymentMethod === 'razorpay' && <ShieldCheck className="w-6 h-6 text-blue-600" />}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="premium-card p-6 md:p-8 bg-white border-2 border-primary/5">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-100">
               <img src={resolveImageUrl(hotel?.images?.[0])} alt="" className="w-full sm:w-24 h-48 sm:h-24 rounded-2xl object-cover shadow-lg" />
               <div className="text-center sm:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-dark tracking-tight leading-tight">{hotel?.name}</h3>
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-2">{room?.roomType} Experience</p>
               </div>
            </div>

            <h3 className="text-lg font-black mb-6 text-dark uppercase tracking-widest text-[10px]">Price Breakdown</h3>
            <div className="space-y-4 pb-8 border-b border-gray-100">
              <div className="flex justify-between items-center text-gray-500 font-medium">
                <span className="text-sm">Stay Duration ({days} nights)</span>
                <span className="text-dark font-bold italic">₹{(room?.price || 0) * days}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-medium">
                <span className="text-sm">Service Fee & Taxes (10%)</span>
                <span className="text-dark font-bold italic">₹{Math.round((room?.price || 0) * days * 0.1)}</span>
              </div>
            </div>
            <div className="pt-8">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Total Amount</span>
                <div className="text-right">
                   <div className="text-4xl md:text-5xl font-black text-primary tracking-tighter leading-none">₹{Math.round((room?.price || 0) * days * 1.1)}</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleBooking}
              disabled={bookingLoading || days <= 0 || !availability.available}
              className="w-full btn-primary py-5 mt-10 text-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>Confirm Booking</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">By clicking, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
