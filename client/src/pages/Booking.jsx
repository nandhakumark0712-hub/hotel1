import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Loader2, Calendar, CreditCard, ArrowRight, ShieldCheck, Info, Wallet, Smartphone, Banknote } from 'lucide-react';

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
      } else if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
        alert('Payment successfull! Your booking is confirmed.');
        navigate(`/payment-success?type=${paymentMethod}&bookingId=${bookingData.data._id}`);
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
                className={`p-5 border-2 flex items-center justify-between cursor-pointer rounded-2xl transition-all hover:shadow-md ${paymentMethod === 'pay-at-hotel' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl mr-4 ${paymentMethod === 'pay-at-hotel' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Pay At Hotel</div>
                    <div className="text-sm text-gray-500">Secure booking, no immediate payment</div>
                  </div>
                </div>
                {paymentMethod === 'pay-at-hotel' && <ShieldCheck className="w-6 h-6 text-primary" />}
              </div>

              <div
                onClick={() => setPaymentMethod('stripe')}
                className={`p-5 border-2 flex flex-col cursor-pointer rounded-2xl transition-all hover:shadow-md ${paymentMethod === 'stripe' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl mr-4 ${paymentMethod === 'stripe' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Credit / Debit Card (Stripe)</div>
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
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all font-mono"
                        maxLength="19"

                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all font-mono"
                        maxLength="5"

                      />
                      <input
                        type="password"
                        placeholder="CVC"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all font-mono"
                        maxLength="3"

                      />
                    </div>
                    <p className="text-xs text-indigo-500 mt-2">* Stripe checkout will verify these details on the next page.</p>
                  </div>
                )}
              </div>

              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-5 border-2 flex items-center justify-between cursor-pointer rounded-2xl transition-all hover:shadow-md ${paymentMethod === 'razorpay' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'}`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl mr-4 ${paymentMethod === 'razorpay' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Razorpay</div>
                    <div className="text-sm text-gray-500">Fast and secure local payments</div>
                  </div>
                </div>
                {paymentMethod === 'razorpay' && <ShieldCheck className="w-6 h-6 text-blue-600" />}
              </div>

              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-5 border-2 flex flex-col cursor-pointer rounded-2xl transition-all hover:shadow-md ${paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl mr-4 ${paymentMethod === 'upi' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">UPI (GPay, Paytm, PhonePe)</div>
                      <div className="text-sm text-gray-500">Scan & Pay or UPI ID</div>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && <ShieldCheck className="w-6 h-6 text-emerald-600" />}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 pt-4 border-t border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center space-x-6 justify-center bg-white p-3 rounded-xl border border-emerald-100">
                      <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="GPay" className="h-6 w-auto opacity-70" />
                      <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" className="h-5 w-auto opacity-70" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6 w-auto opacity-70" />
                    </div>
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g., name@okicici)"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-600 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="premium-card p-8 bg-gray-50/50">
            <div className="flex items-center mb-8">
              <img src={hotel?.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover mr-4" />
              <div>
                <h3 className="text-xl font-bold text-dark">{hotel?.name}</h3>
                <p className="text-sm text-gray-500">{room?.type} Room</p>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-6">Price Summary</h3>
            <div className="space-y-4 pb-8 border-b">
              <div className="flex justify-between items-center text-gray-600">
                <span>{room?.type} x {days} nights</span>
                <span>₹{(room?.price || 0) * days}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Service Fee (10%)</span>
                <span>₹{Math.round((room?.price || 0) * days * 0.1)}</span>
              </div>
            </div>
            <div className="pt-6">
              <div className="flex justify-between items-center text-2xl md:text-3xl font-bold text-dark">
                <span>Total</span>
                <span>₹{Math.round((room?.price || 0) * days * 1.1)}</span>
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
