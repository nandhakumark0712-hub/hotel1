import React from 'react';
import { Scale, CheckCircle, AlertCircle, Calendar, CreditCard } from 'lucide-react';

const Terms = () => {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Scale className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4 tracking-tight">Terms & Conditions</h1>
          <p className="text-gray-500">By using NK Hotel Bookings, you agree to these terms.</p>
        </div>

        <div className="premium-card p-10 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" /> 1. Booking & Reservation
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                All bookings made through NK Hotel Bookings are subject to availability. When you make a booking, you are entering into a direct contract with the hotel. We act as an intermediary platform.
              </p>
              <p>
                You must be at least 18 years old to make a reservation. Users are responsible for providing accurate personal and payment information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" /> 2. Payment & Refunds
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Payments are processed securely at the time of booking or upon arrival at the hotel, depending on the specific hotel's policy.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prices quoted include applicable taxes unless stated otherwise.</li>
                <li>Cancellation policies vary by hotel and room type.</li>
                <li>Refunds, if applicable, are processed within 7-10 business days.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" /> 3. Guest Responsibilities
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Guests are expected to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Abide by the hotel's rules and check-in/check-out times.</li>
                <li>Maintain the property and report any damages immediately.</li>
                <li>Present a valid government-issued ID upon check-in.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-primary" /> 4. Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              NK Hotel Bookings is not responsible for any disputes, damages, or losses that occur during your stay at the hotel. We provide the platform for discovery and booking but do not manage the physical properties.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100 italic text-sm text-gray-400">
            Terms of service are subject to change. Continued use of the platform after changes implies acceptance of the updated terms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
