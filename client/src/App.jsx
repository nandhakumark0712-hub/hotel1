import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ManageHotel from './pages/ManageHotel';
import ManageRooms from './pages/ManageRooms';
import ManagerBookings from './pages/ManagerBookings';
import ManagerReviews from './pages/ManagerReviews';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Invoice from './pages/Invoice';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import UsersManagement from './pages/admin/UsersManagement';
import HotelsManagement from './pages/admin/HotelsManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import Analytics from './pages/admin/Analytics';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import ReviewsManagement from './pages/admin/ReviewsManagement';
import PromotionsManagement from './pages/admin/PromotionsManagement';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login' && location.pathname !== '/admin/register';
  const isManagerPath = location.pathname.startsWith('/manager');

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      {!isAdminPath && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Customer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><Dashboard /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute allowedRoles={['customer']}><Booking /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute allowedRoles={['customer']}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment-cancel" element={<ProtectedRoute allowedRoles={['customer']}><PaymentCancel /></ProtectedRoute>} />
          <Route path="/invoice/:bookingId" element={<ProtectedRoute allowedRoles={['customer']}><Invoice /></ProtectedRoute>} />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/add-hotel" element={<ProtectedRoute allowedRoles={['manager']}><ManageHotel /></ProtectedRoute>} />
          <Route path="/manager/edit-hotel/:id" element={<ProtectedRoute allowedRoles={['manager']}><ManageHotel /></ProtectedRoute>} />
          <Route path="/manager/manage-rooms/:hotelId" element={<ProtectedRoute allowedRoles={['manager']}><ManageRooms /></ProtectedRoute>} />
          <Route path="/manager/bookings/:hotelId" element={<ProtectedRoute allowedRoles={['manager']}><ManagerBookings /></ProtectedRoute>} />
          <Route path="/manager/reviews/:hotelId" element={<ProtectedRoute allowedRoles={['manager']}><ManagerReviews /></ProtectedRoute>} />

          {/* Admin Routes wrapped in AdminLayout */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><UsersManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/hotels" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><HotelsManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><BookingsManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Analytics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><PaymentsManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ReviewsManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/promotions" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><PromotionsManagement /></AdminLayout></ProtectedRoute>} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Direct Role Login Routes */}
          <Route path="/customer/login" element={<Login role="customer" />} />
          <Route path="/customer/register" element={<Register role="customer" />} />
          <Route path="/manager/login" element={<Login role="manager" />} />
          <Route path="/admin/login" element={<Login role="admin" />} />


          <Route path="/login" element={<Login role="customer" />} />
          <Route path="/register" element={<Register role="customer" />} />
        </Routes>
      </main>
      {!isAdminPath && !isManagerPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
