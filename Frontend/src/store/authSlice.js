import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      const { user, accessToken, refreshToken } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/profile");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "auth/updateAddress",
  async ({ addressText, coordinates }, { rejectWithValue }) => {
    try {
      const res = await api.put("/auth/address", { addressText, coordinates });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Address update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("accessToken") || null,
    status: "idle",  // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    // Allow simulation mode to set user directly
    setSimulatedUser(state, action) {
      state.user = action.payload;
      state.token = "sim_token";
      localStorage.setItem("accessToken", "sim_token");
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.token = localStorage.getItem("accessToken");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // address update
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.address = action.payload.address;
        }
      });
  },
});

export const { logout, setSimulatedUser } = authSlice.actions;
export default authSlice.reducer;
