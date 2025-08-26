import { configureStore } from "@reduxjs/toolkit";
import IsLoggedInReducer from "../redux/reducer/IsLoggedInReducer";
const useAuthStore=configureStore({
    reducer:{
        isLoggedInReducer:IsLoggedInReducer
    }
});

export default useAuthStore;