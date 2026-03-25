import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { Hotel, User, LogOut, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';
import LocationSearch from '../hotel/LocationSearch';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show search bar ONLY on home page
  const showSearch = location.pathname === '/';
  
  const isAdminPath = location.pathname.startsWith('/admin');
  const isManagerPath = location.pathname.startsWith('/manager');
  const isCustomerPath = !isAdminPath && !isManagerPath;

  const handleCitySelect = (city) => {
    setSearchCity(city);
  };

  const executeSearch = (city) => {
    const term = city || searchCity;
    if (term.trim()) {
      navigate(`/destinations?city=${encodeURIComponent(term.trim())}`);
      setSearchCity('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/nk_hotel_bookings_logo.png" alt="NK Hotel Bookings Logo" className="w-14 h-14 object-contain mix-blend-multiply" />
            <span className="text-2xl font-bold text-dark tracking-tight">
              {isAdminPath ? 'NK Admin' : isManagerPath ? 'NK Manager' : 'NK Hotel Bookings'}
            </span>
          </Link>

          {/* Center: Location Smart Search — only on home page */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-sm">
              <div className="w-full flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <LocationSearch
                  id="navbar-location-search"
                  value={searchCity}
                  onChange={handleCitySelect}
                  onSelect={(city) => executeSearch(city.name)}
                  placeholder="Where are you going?"
                  unstyled={true}
                />
              </div>
            </div>
          )}

          {/* Right nav - Desktop */}
          <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
            {isCustomerPath && (
              <Link to="/hotels" className="text-gray-600 hover:text-primary transition-colors font-medium text-sm">Find Hotels</Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'customer' && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors font-medium text-sm">My Bookings</Link>
                )}
                {user.role === 'manager' && (
                  <Link to="/manager/dashboard" className="text-gray-600 hover:text-primary transition-colors font-medium text-sm">Manager</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary transition-colors font-medium text-sm">Admin</Link>
                )}

                <NotificationBell />

                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-dark">{user.name}</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => dispatch(logout(user.role))}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-600 font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {isAdminPath ? (
                  <>
                    <Link to="/admin/login" className="btn-primary py-2 px-6 text-sm">Admin Login</Link>
                  </>
                ) : isManagerPath ? (
                  <>
                    <Link to="/manager/login" className="btn-primary py-2 px-6 text-sm">Manager Login</Link>
                  </>
                ) : (

                  <>
                    <Link to="/customer/login" className="text-gray-600 hover:text-primary font-medium text-sm">Login</Link>
                    <Link to="/customer/register" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            {user && <NotificationBell />}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-50 text-dark hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-8 space-y-4">
            {showSearch && (
              <div className="w-full flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <LocationSearch
                  id="mobile-location-search"
                  value={searchCity}
                  onChange={handleCitySelect}
                  onSelect={(city) => executeSearch(city.name)}
                  placeholder="Where are you going?"
                  unstyled={true}
                />
              </div>
            )}

            <div className="space-y-2">
              {isCustomerPath && (
                <Link 
                  to="/hotels" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-dark font-bold hover:bg-gray-50 transition-colors"
                >
                  Find Hotels
                </Link>
              )}

              {user ? (
                <>
                  {user.role === 'customer' && (
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-2xl text-dark font-bold hover:bg-gray-50 transition-colors"
                    >
                      My Bookings
                    </Link>
                  )}
                  {user.role === 'manager' && (
                    <Link 
                      to="/manager/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-2xl text-dark font-bold hover:bg-gray-50 transition-colors"
                    >
                      Manager Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-2xl text-dark font-bold hover:bg-gray-50 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <div className="px-4 py-4 mt-6 bg-gray-50 rounded-3xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-dark">{user.name}</div>
                        <div className="text-xs text-primary font-black uppercase tracking-widest">{user.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { dispatch(logout(user.role)); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-500 py-3 rounded-2xl font-bold hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {isAdminPath ? (
                    <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center p-4 rounded-2xl bg-primary text-white font-bold">Admin Login</Link>
                  ) : isManagerPath ? (
                    <Link to="/manager/login" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center p-4 rounded-2xl bg-primary text-white font-bold">Manager Login</Link>
                  ) : (

                    <>
                      <Link to="/customer/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 rounded-2xl bg-gray-50 font-bold text-dark">Login</Link>
                      <Link to="/customer/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 rounded-2xl bg-primary text-white font-bold">Sign Up</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
