import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <XCircle className="w-12 h-12 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-dark mb-4">Payment Cancelled</h1>
      <p className="text-gray-500 text-lg mb-12">
        Your payment process was interrupted. No charges were made. You can try booking again when you're ready.
      </p>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link 
          to="/hotels"
          className="flex items-center justify-center p-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Hotels
        </Link>
        <Link 
          to="/dashboard"
          className="flex items-center justify-center p-4 bg-dark text-white rounded-2xl font-bold hover:bg-black transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
