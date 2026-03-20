import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Hotel, 
  BookOpen, 
  CreditCard, 
  Star, 
  Megaphone, 
  LogOut,
  ChevronRight,
  Activity,
  X
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Hotels', path: '/admin/hotels', icon: <Hotel size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <BookOpen size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <Star size={20} /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <Megaphone size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <Activity size={20} /> },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r h-screen flex flex-col shadow-sm transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 border-b flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <img src="/nk_hotel_bookings_logo.png" alt="Logo" className="w-12 h-12 object-contain mix-blend-multiply" />
          <div className="hidden sm:block">
            <span className="text-xl font-black text-dark tracking-tighter block leading-none">NK Admin</span>
            <span className="text-[10px] text-primary uppercase font-black tracking-widest">Management</span>
          </div>
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-dark">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-dark hover:translate-x-1'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`${isActive ? 'text-white' : 'text-primary/60 group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                <span className="font-bold tracking-tight">{item.name}</span>
              </div>
              <ChevronRight size={16} className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t">
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center space-x-4 w-full p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors group font-bold"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
