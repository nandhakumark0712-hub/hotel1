import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import RoomCard from '../components/hotel/RoomCard';
import { Loader2, Star, MapPin, ShieldCheck, MessageCircle, Hotel, Utensils, Heart, Waves, Dumbbell, Gamepad, CheckCircle2, Wifi, Zap } from 'lucide-react';
import { resolveImageUrl } from '../utils/urlHelper';

const HotelDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const [hotelRes, reviewsRes] = await Promise.all([
          API.get(`/api/hotels/${id}`),
          API.get(`/api/reviews/${id}`)
        ]);
        setHotel(hotelRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleBookRoom = (room) => {
    navigate(`/booking?hotelId=${hotel._id}&roomId=${room._id}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await API.post('/api/reviews', {
        hotelId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      // Fetch all to get populated user
      const reviewsRes = await API.get(`/api/reviews/${id}`);
      setReviews(reviewsRes.data.data);
      setReviewForm({ rating: 5, comment: '' });
      alert('Review added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!hotel) return <div className="text-center py-24">Hotel not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Gallery */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-12">
        {hotel.images && hotel.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-auto md:h-[500px]">
            <div className="md:col-span-2 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-gray-100 h-64 md:h-full">
              <img src={resolveImageUrl(hotel.images[0])} alt={hotel.name} className="w-full h-full object-cover" />
            </div>
            {hotel.images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-4 h-32 md:h-full">
                <div className="flex-1 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
                  <img src={resolveImageUrl(hotel.images[1])} alt={hotel.name} className="w-full h-full object-cover" />
                </div>
                {hotel.images.length > 2 && (
                  <div className="flex-1 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
                    <img src={resolveImageUrl(hotel.images[2])} alt={hotel.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400">
             <div className="text-center">
                <Hotel className="w-16 h-16 mx-auto mb-4" />
                <p className="font-bold">No images provided by the hotel</p>
             </div>
          </div>
        )}
      </div>

      {/* Promotion Banner */}
      {hotel.promotion?.isActive && (
        <div className="mb-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20 animate-bounce-slow">
              <span className="text-3xl md:text-4xl font-black">{hotel.promotion?.discount || 0}%</span>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-dark tracking-tight leading-tight mb-1">
                {hotel.promotion?.title || 'Limited Time Special Offer!'}
              </h3>
              <p className="text-gray-500 font-medium max-w-xl italic">"{hotel.promotion?.message || 'Check out our latest deals'}"</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl border border-primary/20 relative z-10 shrink-0">
             <span className="text-primary font-black uppercase tracking-widest text-xs">Deal Applied Automatically</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Info Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2 tracking-tight">{hotel.name}</h1>
              <div className="flex items-start text-gray-500">
                <MapPin className="w-5 h-5 mr-1 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{hotel.location?.address}, {hotel.location?.city}</span>
              </div>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center shrink-0">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-primary fill-primary mr-2" />
              <span className="text-lg md:text-xl font-bold text-primary">{hotel.rating || 0}</span>
            </div>
          </div>

          <div className="prose max-w-none text-gray-600 mb-12">
            <p className="text-lg leading-relaxed">{hotel.description}</p>
          </div>

          {/* Categorized Amenities */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-dark tracking-tight">Hotel Amenities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Food & Drinks */}
              <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500 shrink-0">
                    <Utensils size={28} />
                  </div>
                  <h3 className="text-lg font-black text-dark leading-tight mt-1">Food and Drinks</h3>
                </div>
                <ul className="space-y-3 flex-grow">
                  {['Restaurant', 'Room service [24-hour]', 'Coffee shop'].map(a => (
                    <li key={a} className={`flex items-start gap-3 text-sm ${hotel.amenities?.includes(a) || hotel.amenities?.includes('Restaurant') ? 'text-gray-600' : 'text-gray-300'}`}>
                      <CheckCircle2 size={18} className={`${hotel.amenities?.includes(a) || (a === 'Restaurant' && hotel.amenities?.includes('Restaurant')) ? 'text-green-600' : 'text-gray-200'} shrink-0 mt-0.5`} />
                      <span className="font-semibold">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Wellness */}
              <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-teal-500 shrink-0">
                    <Heart size={28} />
                  </div>
                  <h3 className="text-lg font-black text-dark leading-tight mt-1">Wellness</h3>
                </div>
                <ul className="space-y-3">
                  {['Fitness center', 'Spa', 'Massage', 'Gym'].map(a => (
                    <li key={a} className={`flex items-start gap-3 text-sm ${hotel.amenities?.includes(a) ? 'text-gray-600' : 'text-gray-300'}`}>
                      <CheckCircle2 size={18} className={`${hotel.amenities?.includes(a) ? 'text-green-600' : 'text-gray-200'} shrink-0 mt-0.5`} />
                      <span className="font-semibold">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities */}
              <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500 shrink-0">
                    <Waves size={28} />
                  </div>
                  <h3 className="text-lg font-black text-dark leading-tight mt-1">Activities</h3>
                </div>
                <ul className="space-y-3">
                  {['Pool', 'Swimming Pool', 'Ocean View'].map(a => (
                    <li key={a} className={`flex items-start gap-3 text-sm ${hotel.amenities?.includes(a) ? 'text-gray-600' : 'text-gray-300'}`}>
                      <CheckCircle2 size={18} className={`${hotel.amenities?.includes(a) ? 'text-green-600' : 'text-gray-200'} shrink-0 mt-0.5`} />
                      <span className="font-semibold">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sports & Ent */}
              <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500 shrink-0">
                    <Gamepad size={28} />
                  </div>
                  <h3 className="text-lg font-black text-dark leading-tight mt-1">Sports & Ent</h3>
                </div>
                <ul className="space-y-3 flex-grow">
                  {['Tennis Court', 'Game Room', 'TV'].map(a => (
                    <li key={a} className={`flex items-start gap-3 text-sm ${hotel.amenities?.includes(a) ? 'text-gray-600' : 'text-gray-300'}`}>
                      <CheckCircle2 size={18} className={`${hotel.amenities?.includes(a) ? 'text-green-600' : 'text-gray-200'} shrink-0 mt-0.5`} />
                      <span className="font-semibold">{a}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-8 text-sm font-bold text-primary hover:underline self-center">See all amenities</button>
              </div>

            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-dark tracking-tight">Select Room Type</h2>
          <div className="space-y-6">
            {hotel.rooms?.map((room) => (
              <RoomCard key={room._id} room={room} onSelect={handleBookRoom} />
            ))}
          </div>

          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-10 text-dark tracking-tight">Guest Reviews</h2>
            
            {/* Add Review Form */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="mb-12 bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                  <select 
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                    className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Experience</label>
                  <textarea 
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Tell us what you loved about this place..."
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="btn-primary"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-12 text-center text-gray-500 italic">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-8 last:border-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary mr-4">
                          {review.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-dark">{review.userId?.name || 'Unknown User'}</div>
                          <div className="text-gray-400 text-sm">Review posted on {new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-accent/10 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-accent fill-accent mr-1" />
                        <span className="font-bold text-accent">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed italic">{review.comment}</p>
                    
                    {review.managerReply && (
                      <div className="mt-4 ml-12 p-4 bg-gray-50 rounded-2xl border-l-4 border-primary/40 relative">
                        <MessageCircle className="absolute -left-3 top-4 w-5 h-5 text-primary/40 bg-white" />
                        <div className="font-bold text-sm text-dark mb-1">Response from Management</div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.managerReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="premium-card p-8 sticky top-24 border-primary/20 bg-primary/[0.02]">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <ShieldCheck className="w-6 h-6 text-primary mr-2" />
              NK Hotel Bookings Guarantee
            </h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1"><Check className="w-4 h-4 text-green-600" /></div>
                <span>Best price guaranteed</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1"><Check className="w-4 h-4 text-green-600" /></div>
                <span>24/7 Customer support</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1"><Check className="w-4 h-4 text-green-600" /></div>
                <span>Secure payment processing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Check = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

export default HotelDetails;
