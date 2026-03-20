import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <img src="/nk_hotel_bookings_logo.png" alt="NK Hotel Bookings Logo" className="w-14 h-14 object-contain mix-blend-multiply" />
              <span className="text-2xl font-bold text-dark tracking-tight">NK Hotel Bookings</span>
            </Link>
            <p className="text-gray-400 max-w-xs">Connecting you with the world's most luxurious stays since 2026.</p>
          </div>
          
          <div className="flex gap-12 text-sm font-bold text-dark uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} NK Hotel Bookings. All rights reserved.</p>
          <div className="flex gap-6">
            <span>English (IN)</span>
            <span>₹ INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
