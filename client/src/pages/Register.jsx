import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, reset } from '../redux/slices/authSlice';
import { User, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Register = ({ role: initialRole }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: initialRole || 'customer' 
  });
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (initialRole) {
      setFormData(prev => ({ ...prev, role: initialRole }));
    }
  }, [initialRole]);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'manager') {
          navigate('/manager/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, navigate, location.state]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submission started:', formData);
    dispatch(register(formData));
  };

  const getTitle = () => {
    switch(formData.role) {
      case 'admin': return 'Admin Registration';
      case 'manager': return 'Manager Registration';
      default: return 'Create Account';
    }
  };

  const getLoginLink = () => {
    if (initialRole) {
      return `/${initialRole}/login`;
    }
    return '/login';
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">{getTitle()}</h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            {formData.role === 'customer' ? 'Join NK Hotel Bookings and start booking today' : 'Register to manage your property'}
          </p>
        </div>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="name@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500 leading-tight">
                Must be at least 8 characters.
              </p>
            </div>

            {!initialRole && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="customer">Customer</option>
                    <option value="manager">Hotel Manager</option>
                    <option value="admin">Admin Console</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 flex items-center justify-center space-x-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to={getLoginLink()} className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
