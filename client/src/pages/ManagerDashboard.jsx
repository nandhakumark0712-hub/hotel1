import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { logout } from '../redux/slices/authSlice';
import { Loader2, Plus, Hotel, LayoutDashboard, Bed, BookOpen, MessageCircle, LogOut, Edit, Trash2, Menu, X } from 'lucide-react';
import Footer from '../components/layout/Footer';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabFromUrl = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTabState] = useState(activeTabFromUrl);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTabState(searchParams.get('tab'));
    }
  }, [searchParams]);
  const [hotels, setHotels] = useState([]);
  const [stats, setStats] = useState({ totalHotels: 0, totalRooms: 0, bookingsToday: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsRes, statsRes] = await Promise.all([
          API.get(`/api/hotels?managerId=${user._id}`),
          API.get('/api/hotels/manager/stats')
        ]);
        setHotels(hotelsRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setStats(statsRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel and all its rooms?')) return;
    try {
      await API.delete(`/api/hotels/${id}`);
      setHotels(hotels.filter(h => h._id !== id));
      setStats(prev => ({ ...prev, totalHotels: prev.totalHotels - 1 }));
    } catch (error) {
      alert('Error deleting hotel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    dispatch(logout(user.role));
    navigate('/login');
  };

  // Helper to render "Select Hotel" for tabs that need a hotel ID
  const SelectHotelPrompt = ({ title, icon: Icon, linkPrefix }) => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-dark tracking-tight">{title}</h2>
      <p className="text-gray-500 mb-8">Select a property below to manage its {title.toLowerCase()}.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map(hotel => (
          <Link key={hotel._id} to={`${linkPrefix}/${hotel._id}`} className="premium-card p-6 flex items-center justify-between hover:border-primary transition-colors group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                 <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-dark">{hotel.name}</h3>
                <p className="text-sm text-gray-500">{hotel.location.city}</p>
              </div>
            </div>
          </Link>
        ))}
        {hotels.length === 0 && (
           <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed">
              No hotels available.
           </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative">
      {/* Mobile Sidebar Toggle Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-40 lg:hidden mt-16"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:fixed top-16 inset-y-0 left-0 z-40 w-72 lg:w-64 bg-white border-r border-gray-100 lg:h-[calc(100vh-64px)] overflow-y-auto transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
               <h2 className="text-xl font-black text-primary tracking-tighter">Manager Portal</h2>
               <p className="text-xs text-gray-400 font-bold mt-1">Welcome back, {user.name}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
               <X className="w-6 h-6" />
            </button>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('hotels')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'hotels' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
          >
            <Hotel className="w-5 h-5 mr-3" /> Manage Hotels
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'rooms' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
          >
            <Bed className="w-5 h-5 mr-3" /> Manage Rooms
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'reservations' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
          >
            <BookOpen className="w-5 h-5 mr-3" /> Reservations
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'reviews' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
          >
            <MessageCircle className="w-5 h-5 mr-3" /> Reviews
          </button>
          <div className="pt-8 mt-8 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-dark">
              <Menu className="w-6 h-6" />
           </button>
           <h2 className="font-black text-primary tracking-tighter">NK Manager</h2>
           <div className="w-10"></div> {/* Spacer */}
        </div>
        
        <div className="p-6 lg:p-10 flex-grow">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-dark mb-8 tracking-tight">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               <div className="premium-card p-6 bg-gradient-to-br from-white to-blue-50/50">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Hotel className="w-6 h-6" /></div>
                  <div className="text-gray-500 font-bold text-sm mb-1">Total Hotels</div>
                  <div className="text-3xl font-black text-dark">{stats.totalHotels}</div>
               </div>
               <div className="premium-card p-6 bg-gradient-to-br from-white to-orange-50/50">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><Bed className="w-6 h-6" /></div>
                  <div className="text-gray-500 font-bold text-sm mb-1">Total Rooms</div>
                  <div className="text-3xl font-black text-dark">{stats.totalRooms}</div>
               </div>
               <div className="premium-card p-6 bg-gradient-to-br from-white to-green-50/50">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4"><BookOpen className="w-6 h-6" /></div>
                  <div className="text-gray-500 font-bold text-sm mb-1">Bookings Today</div>
                  <div className="text-3xl font-black text-dark">{stats.bookingsToday}</div>
               </div>
               <div className="premium-card p-6 bg-gradient-to-br from-white to-purple-50/50">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4"><span className="text-xl font-black">₹</span></div>
                  <div className="text-gray-500 font-bold text-sm mb-1">Revenue</div>
                  <div className="text-3xl font-black text-dark">₹{stats.revenue.toLocaleString()}</div>
               </div>
            </div>
          </div>
        )}

        {/* MANAGE HOTELS TAB */}
        {activeTab === 'hotels' && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-dark tracking-tight">Manage Hotels</h1>
              <Link to="/manager/add-hotel" className="btn-primary py-2 px-4 flex items-center">
                 <Plus className="w-5 h-5 mr-2" />
                 Add New Hotel
              </Link>
            </div>
            
            <div className="premium-card overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                           <th className="p-4 font-bold text-gray-500 text-sm">Hotel Name</th>
                           <th className="p-4 font-bold text-gray-500 text-sm">Location</th>
                           <th className="p-4 font-bold text-gray-500 text-sm text-center">Rooms</th>
                           <th className="p-4 font-bold text-gray-500 text-sm text-center">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {hotels.map(hotel => (
                           <tr key={hotel._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                 <div className="flex items-center">
                                    <img src={hotel?.images?.[0] || 'https://placehold.co/100?text=Hotel'} alt={hotel.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                                    <span className="font-bold text-dark">{hotel.name}</span>
                                 </div>
                              </td>
                              <td className="p-4 text-gray-600">{hotel.location?.city}, {hotel.location?.address}</td>
                              <td className="p-4 text-center">
                                 <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs">
                                    {(hotel.rooms || []).length} Types
                                 </span>
                              </td>
                              <td className="p-4">
                                 <div className="flex items-center justify-center gap-2">
                                    <Link to={`/manager/edit-hotel/${hotel._id}`} className="p-2 text-gray-400 hover:text-primary bg-white rounded-lg border border-gray-200 shadow-sm transition-all focus:ring-2 focus:ring-primary outline-none">
                                       <Edit className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDeleteHotel(hotel._id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-red-200 transition-all focus:ring-2 focus:ring-red-500 outline-none">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {hotels.length === 0 && (
                           <tr>
                              <td colSpan="4" className="p-8 text-center text-gray-500 italic">No hotels added yet.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {/* OTHER TABS AS PROMPTS */}
        {activeTab === 'rooms' && (
           <div className="animate-fade-in-up">
              <SelectHotelPrompt title="Manage Rooms" icon={Bed} linkPrefix="/manager/manage-rooms" />
           </div>
        )}
        
        {activeTab === 'reservations' && (
           <div className="animate-fade-in-up">
              <SelectHotelPrompt title="Reservations" icon={BookOpen} linkPrefix="/manager/bookings" />
           </div>
        )}
        
        {activeTab === 'reviews' && (
           <div className="animate-fade-in-up">
              <SelectHotelPrompt title="Reviews" icon={MessageCircle} linkPrefix="/manager/reviews" />
           </div>
        )}
        
        </div>
          <Footer />
        </main>
    </div>
  );
};

export default ManagerDashboard;
