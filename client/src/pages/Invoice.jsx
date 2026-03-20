import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Loader2, Printer, MapPin, Calendar, Clock, Download } from 'lucide-react';

const Invoice = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await API.get('/api/bookings/my-bookings');
        const found = data.data.find(b => b._id === bookingId);
        if (found) setBooking(found);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  if (!booking) return <div className="text-center py-20">Invoice not found.</div>;

  const days = Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8 print:hidden">
         <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-dark flex items-center font-bold">
           <MapPin className="w-5 h-5 mr-2" /> Back
         </button>
         <button onClick={() => window.print()} className="btn-primary flex items-center">
           <Printer className="w-5 h-5 mr-2" /> Print Invoice
         </button>
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 invoice-container">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tighter mb-2">NK Hotel Bookings</h1>
            <p className="text-gray-400 font-medium">Official Booking Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-dark mb-1">Invoice #{booking._id.slice(-8).toUpperCase()}</h2>
            <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-4">Customer</h4>
            <div className="text-lg font-bold text-dark">User ID: {booking.userId}</div>
            <p className="text-gray-500">Email: Customer-provided during booking</p>
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-4">Property</h4>
            <div className="text-lg font-bold text-dark">{booking.hotelId.name}</div>
            <p className="text-gray-500">{booking.hotelId.location.address}, {booking.hotelId.location.city}</p>
          </div>
        </div>

        <div className="mb-16">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-4 font-bold text-dark">Description</th>
                <th className="py-4 font-bold text-dark">Qty</th>
                <th className="py-4 font-bold text-dark text-right">Unit Price</th>
                <th className="py-4 font-bold text-dark text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="py-6">
                  <div className="font-bold text-dark">{booking.roomId.type || 'Standard'} Room</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-6 text-gray-600">{days} Nights</td>
                <td className="py-6 text-gray-600 text-right">₹{booking.roomId.price}</td>
                <td className="py-6 font-bold text-dark text-right">₹{booking.roomId.price * days}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{booking.roomId.price * days}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (GST 18%)</span>
              <span>₹{Math.round(booking.roomId.price * days * 0.18)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t-2 border-gray-100">
              <span className="font-bold text-xl text-dark">Total</span>
              <span className="font-bold text-3xl text-primary">₹{booking.totalPrice}</span>
            </div>
            <div className="mt-8 pt-4 border-t text-right">
               <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                 Payment Status: {booking.paymentStatus}
               </span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">Thank you for traveling with NK Hotel Bookings. Have a pleasant stay!</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
