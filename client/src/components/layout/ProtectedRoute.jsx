import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setRoleUser } from '../../redux/slices/authSlice';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  // Handle dynamic role-based session switching on refresh or navigation
  React.useEffect(() => {
    const path = location.pathname;
    let expectedKey = 'user_customer';
    if (path.startsWith('/manager')) expectedKey = 'user_manager';
    else if (path.startsWith('/admin')) expectedKey = 'user_admin';
    
    const storedUser = sessionStorage.getItem(expectedKey);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // If we have a stored user for this role and it's different from current Redux user, swap it
      if (user?._id !== parsed._id) {
        dispatch(setRoleUser(parsed));
      }
    }

  }, [location.pathname, dispatch, user?._id]);

  // 1. Initial Auth Hydration check:
  // If we have a user in state but isLoading is true (e.g. from an async action), 
  // we still want to show the content if the user is already authenticated.
  if (isLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // 2. Check if user exists
  if (!user) {
    const loginPath = allowedRoles?.includes('admin') ? "/admin/login" : 
                     allowedRoles?.includes('manager') ? "/manager/login" : "/login";
                     
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 3. Admin override: Admins can visit any protected route
  if (user.role === 'admin') {
    return children;
  }

  // 4. Role-based check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is on a totally wrong path, send them to their role's dashboard
    if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
