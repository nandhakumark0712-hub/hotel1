import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await API.get('/api/notifications');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, thunkAPI) => {
    try {
      const body = notificationId ? { notificationId } : {};
      const res = await API.put('/api/notifications/read', body);
      return { notificationId, data: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, thunkAPI) => {
    try {
      await API.delete(`/api/notifications/${notificationId}`);
      return notificationId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    // Called when a real-time socket notification arrives
    addRealtimeNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // markNotificationRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        if (notificationId) {
          // Single notification marked read
          const n = state.items.find(i => i._id === notificationId);
          if (n && !n.isRead) {
            n.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        } else {
          // All marked read
          state.items.forEach(n => { n.isRead = true; });
          state.unreadCount = 0;
        }
      })

      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const removed = state.items.find(i => i._id === id);
        if (removed && !removed.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter(i => i._id !== id);
      });
  },
});

export const { addRealtimeNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
