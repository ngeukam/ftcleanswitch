import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Typage du state
interface AuthState {
  isLoggedIn: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Valeur initiale typée
const initialState: AuthState = {
  isLoggedIn: false,
  status: "idle",
  error: null,
};

const isLoggedInSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = isLoggedInSlice.actions;
export default isLoggedInSlice.reducer;
