import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { RouterProvider } from "react-router-dom";
import StickyFooter from "./components/StickyFooter";
import { router } from "./router";
//import { themeOptions } from "./themeOptions";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useThemeStore } from "./store/themeStore";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
//const Theme = createTheme(themeOptions);

export default function App() {
  const { theme } = useThemeStore();

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />
      <React.Suspense
        fallback={
          <Box sx={{ display: "flex", align:"center" }}>
            <CircularProgress />
          </Box>
        }
      >
        <RouterProvider router={router} />
        <ToastContainer position="top-right"theme="colored" autoClose={3000} hideProgressBar={false} style={{marginBottom:'30px'}} />
        <StickyFooter />
      </React.Suspense>
    </ThemeProvider>
  );
}
