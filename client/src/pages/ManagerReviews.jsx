import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Loader2, MessageCircle, Star, CornerDownRight } from 'lucide-react';

const ManagerReviews = () => {
  const { hotelId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviewsAndHotel = async () => {
      try {
        const [hotelRes, reviewsRes] = await Promise.all([
          API.get(`/api/hotels/${hotelId}`),
          API.get(`/api/reviews/${hotelId}`)
        ]);
        setHotel(hotelRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewsAndHotel();
  }, [hotelId]);

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.put(`/api/reviews/reply/${reviewId}`, {
        managerReply: replyText
      });
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, managerReply: replyText } : r));
      setActiveReplyId(null);
      setReplyText('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <img 
            src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a850601f010?w=100'} 
            className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" 
            alt={hotel?.name} 
          />
          <div>
            <h1 className="text-3xl font-bold text-dark mb-1 flex items-center gap-3">
               Guest Reviews
            </h1>
            <p className="text-gray-400 text-sm font-medium">Managing all reviews and feedback for {hotel?.name}.</p>
          </div>
        </div>
        <Link to="/manager/dashboard" className="btn-secondary py-2.5 px-6 shrink-0 font-bold">Back to Dashboard</Link>
      </div>

      {reviews.length === 0 ? (
        <div className="premium-card p-12 text-center text-gray-500 border-2 border-dashed">
          No reviews available for this property yet.
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="premium-card p-6 border-l-4 border-l-primary/40">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 mr-4">
                    {review.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-dark">{review.userId?.name || 'Unknown Guest'}</div>
                    <div className="text-xs text-gray-400">Posted on {new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center bg-accent/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-accent fill-accent mr-1" />
                  <span className="font-bold text-accent">{review.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {review.managerReply ? (
                 <div className="mt-4 ml-6 p-4 bg-green-50 rounded-2xl border border-green-100 relative">
                    <CornerDownRight className="absolute -left-4 top-4 w-5 h-5 text-green-300" />
                    <div className="flex justify-between items-center mb-2">
                       <div className="font-bold text-sm text-green-800">Your Reply</div>
                       <button onClick={() => { setActiveReplyId(review._id); setReplyText(review.managerReply); }} className="text-xs font-bold text-green-600 hover:text-green-800">Edit</button>
                    </div>
                    <p className="text-sm text-gray-700">{review.managerReply}</p>
                 </div>
              ) : (
                 !activeReplyId || activeReplyId !== review._id ? (
                    <button 
                      onClick={() => { setActiveReplyId(review._id); setReplyText(''); }}
                      className="mt-2 flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Reply to Review
                    </button>
                 ) : null
              )}

              {activeReplyId === review._id && (
                <div className="mt-4 relative animate-fade-in-up">
                  <textarea 
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary text-sm resize-none pr-32 bg-gray-50"
                    rows="3"
                    placeholder="Type your response to this guest..."
                  ></textarea>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleReplySubmit(review._id)}
                      disabled={submitting || !replyText.trim()}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerReviews;
