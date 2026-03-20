import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Whether you have a question about bookings, partnerships, or just want to say hello, we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="premium-card p-10 bg-white rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-8 text-dark">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-lg font-semibold text-dark">+91 7603883212</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-lg font-semibold text-dark">nkhotelb@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Office</p>
                    <p className="text-lg font-semibold text-dark">New Delhi, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Hours</p>
                    <p className="text-lg font-semibold text-dark">24/7 Support Available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-10 bg-dark text-white rounded-3xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">Direct Communication</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connect with our team instantly via WhatsApp or Telegram for the fastest response to your queries.
              </p>
              <div className="flex gap-4">
                <button className="flex-1 py-3 px-6 bg-primary rounded-xl font-bold text-center transition-all hover:bg-primary/90">
                  WhatsApp
                </button>
                <button className="flex-1 py-3 px-6 bg-white/10 rounded-xl font-bold text-center transition-all hover:bg-white/20">
                  Telegram
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="premium-card p-10 bg-white rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 text-dark">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-transparent focus:border-primary focus:bg-white transition-all py-4 px-6 rounded-xl outline-none" 
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-transparent focus:border-primary focus:bg-white transition-all py-4 px-6 rounded-xl outline-none" 
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-50 border border-transparent focus:border-primary focus:bg-white transition-all py-4 px-6 rounded-xl outline-none" 
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-primary focus:bg-white transition-all py-4 px-6 rounded-xl outline-none appearance-none">
                  <option>General Inquiry</option>
                  <option>Booking Issue</option>
                  <option>Property Partnership</option>
                  <option>Refund Request</option>
                  <option>Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full bg-gray-50 border border-transparent focus:border-primary focus:bg-white transition-all py-4 px-6 rounded-xl outline-none resize-none" 
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
