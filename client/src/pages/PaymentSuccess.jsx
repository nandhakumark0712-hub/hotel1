import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Loader2, CheckCircle, FileText, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type'); // 'razorpay' or 'stripe'
  const bookingId = searchParams.get('bookingId');
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        if (sessionId) {
          const { data } = await API.post(`/api/payments/confirm/${sessionId}`);
          if (data.success) {
            setBooking(data.booking);
          } else {
            setError(true);
          }
        } else if (bookingId) {
          // If redirected from Razorpay simulate, we might already be confirmed
          const { data } = await API.get(`/api/bookings/my-bookings`);
          const found = data.data.find(b => b._id === bookingId);
          setBooking(found);
        }
      } catch (err) {
        console.error('Payment confirmation failed', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    confirmPayment();
  }, [sessionId, bookingId]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-dark">Confirming Payment...</h2>
      <p className="text-gray-500 mt-2 font-medium">Please do not refresh or close this page.</p>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <XCircle className="w-12 h-12 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-dark mb-4">Verification Failed</h1>
      <p className="text-gray-500 text-lg mb-12">
        We couldn't verify your payment. If money was deducted, please contact support with your Booking ID.
      </p>
      <Link to="/dashboard" className="btn-primary px-8 py-4">Go to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold text-dark mb-4">Payment Successful!</h1>
      <p className="text-gray-500 text-lg mb-4">
        Thank you for choosing NK Hotel Bookings. Your reservation at **{booking?.hotelId?.name || 'the hotel'}** is now confirmed.
      </p>
      {booking && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-12 border border-dashed border-gray-200 inline-block px-12">
            <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Booking Reference</div>
            <div className="text-lg font-mono font-bold text-dark">#{booking._id.slice(-8).toUpperCase()}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to={`/invoice/${booking?._id}`}
          className="flex items-center justify-center p-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-colors group"
        >
          <FileText className="w-5 h-5 mr-2 text-primary" />
          View Invoice
        </Link>
        <Link 
          to="/dashboard"
          className="flex items-center justify-center p-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
