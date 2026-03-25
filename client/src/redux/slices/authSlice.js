import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../services/api';

const getInitialUser = () => {
  try {
    const path = window.location.pathname;
    let key = 'user_customer';
    if (path.startsWith('/manager')) key = 'user_manager';
    else if (path.startsWith('/admin')) key = 'user_admin';
    
    const storedUser = sessionStorage.getItem(key);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing user from sessionStorage:', error);
    return null;
  }
};

const user = getInitialUser();

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await API.post('/api/auth/login', userData);
    if (response.data) {
      const roleKey = `user_${response.data.role}`;
      sessionStorage.setItem(roleKey, JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await API.post('/api/auth/register', userData);
    if (response.data) {
      const roleKey = `user_${response.data.role}`;
      sessionStorage.setItem(roleKey, JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user ? user : null,
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    logout: (state, action) => {
      const role = action.payload || state.user?.role || 'customer';
      sessionStorage.removeItem(`user_${role}`);
      state.user = null;
    },

    setRoleUser: (state, action) => {
      state.user = action.payload;
    },
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { logout, reset, setRoleUser } = authSlice.actions;
export default authSlice.reducer;
