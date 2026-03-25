import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Login = ({ role: initialRole }) => {
  const [formData, setFormData] = useState({ 
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
    // Handle OAuth Success
    const params = new URLSearchParams(location.search);
    const oauth_success = params.get('oauth_success');
    const userData = params.get('user');

    // Only dispatch if user is not already logged in
    if (oauth_success && userData && !user) {
      const parsedUser = JSON.parse(decodeURIComponent(userData));
      const roleKey = `user_${parsedUser.role}`;
      sessionStorage.setItem(roleKey, JSON.stringify(parsedUser));
      dispatch({ type: 'auth/login/fulfilled', payload: parsedUser });
    }

  }, [location.search, dispatch, user]);

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
    dispatch(login(formData));
  };

  const handleSocialLogin = (provider) => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    // Use /auth/ prefix which is mounted directly in server.js for OAuth flows
    const path = `/auth/${provider}`;
    window.location.href = `${backendUrl}${path}`;
  };

  const getTitle = () => {
    switch(formData.role) {
      case 'admin': return 'Admin Login';
      case 'manager': return 'Manager Login';
      default: return 'Customer Login';
    }
  };

  const getRegisterLink = () => {
    if (initialRole) {
      return `/${initialRole}/register`;
    }
    return '/register';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">{getTitle()}</h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">Sign in to your account to continue</p>
        </div>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
            </div>
            
            {!initialRole && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                    value={formData.role}
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

          <div className="flex justify-end">
            <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-primary hover:text-primary-dark">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        {formData.role !== 'admin' && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
               <button 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
               >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5 mr-2" />
                  Continue with Google
               </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500">
          Don't have an account? <Link to={getRegisterLink()} className="text-primary font-bold hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
