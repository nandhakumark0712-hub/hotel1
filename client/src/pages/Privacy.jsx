import React from 'react';
import { Shield, Lock, Eye, FileText, Database } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: March 17, 2026</p>
        </div>

        <div className="premium-card p-10 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" /> 1. Information We Collect
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We collect information you provide directly to us when you create an account, make a booking, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number, and mailing address.</li>
                <li>Payment information (processed securely through our partners).</li>
                <li>Booking history and preferences.</li>
                <li>Communications you send to our support team.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" /> 2. How We Use Your Information
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>We use the collected information for various purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and manage your hotel bookings.</li>
                <li>To send you transactional emails and booking confirmations.</li>
                <li>To provide customer support and respond to your requests.</li>
                <li>To personalize your experience and improve our services.</li>
                <li>To send you promotional offers (only if you opt-in).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" /> 3. Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your personal information. Your sensitive data is encrypted, and payment processing is handled by PCI-DSS compliant partners. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" /> 4. Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, correct, or delete your personal information at any time. You can manage your profile settings through your dashboard or contact our support team at <span className="text-primary font-semibold">nkhotelb@gmail.com</span> for assistance.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm text-center text-gray-400">
              © 2026 NK Hotel Bookings. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
