import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add a request interceptor to include the JWT token
API.interceptors.request.use((config) => {
  const path = window.location.pathname;
  let key = 'user_customer';
  if (path.startsWith('/manager')) key = 'user_manager';
  else if (path.startsWith('/admin')) key = 'user_admin';

  const user = JSON.parse(sessionStorage.getItem(key));
  if (user && user.token) {

    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Add a response interceptor to handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      // No more hard redirect here. ProtectedRoute will handle it in the UI.
    }
    return Promise.reject(error);
  }
);

export default API;
