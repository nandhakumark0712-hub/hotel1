import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { Search, User as UserIcon, Menu, X, LogOut } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';
import NotificationBell from '../layout/NotificationBell';

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout('admin'));
    navigate('/admin/login');
  };

  return (
    <div className="flex bg-[#f8fafc] h-screen overflow-hidden font-inter relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b sticky top-0 z-30 flex items-center justify-between px-4 sm:px-10 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden bg-gray-50 rounded-xl text-dark"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 max-w-xl group hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search analytics..." 
                  className="w-full min-w-[300px] pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationBell />

            <div className="h-10 w-px bg-gray-100 mx-2 hidden sm:block"></div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-dark tracking-tight leading-none">{user?.name}</div>
                <div className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">Super Admin</div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                <UserIcon size={20} className="sm:size-6" />
              </div>
            </div>
            
            <div className="h-10 w-px bg-gray-100 mx-2"></div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-500 hover:bg-red-100/50 px-4 py-2 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span className="hidden lg:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-10 overflow-auto flex flex-col">
          <div className="animate-in fade-in duration-700 flex-grow">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
