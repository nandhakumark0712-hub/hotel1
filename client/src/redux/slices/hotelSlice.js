import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchHotels = createAsyncThunk('hotels/fetchAll', async (filters, thunkAPI) => {
  try {
    const response = await API.get('/api/hotels', { params: filters });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch hotels');
  }
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    hotels: [],
    hotel: null,
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => { state.isLoading = true; })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = hotelSlice.actions;
export default hotelSlice.reducer;
