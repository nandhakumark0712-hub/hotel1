import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/api/auth/verifyemail/${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-24 text-center">
      <div className="premium-card p-12">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold">Verifying your email...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
            <p className="text-gray-500 mb-8">Your email has been successfully verified. You can now access all features.</p>
            <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
            <p className="text-gray-500 mb-8">The verification link is invalid or has expired.</p>
            <Link to="/register" className="btn-primary inline-block">Try Registering Again</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
