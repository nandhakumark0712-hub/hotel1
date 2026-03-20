import React, { useState } from 'react';
import API from '../services/api';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-md mx-auto mt-24 premium-card p-12 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">Email Sent!</h2>
      <p className="text-gray-500">Please check your inbox for instructions to reset your password.</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-24">
      <div className="premium-card p-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Forgot Password</h2>
        <p className="text-gray-500 text-center mb-8">Enter your email and we'll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
