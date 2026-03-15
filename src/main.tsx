import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById("root");
if (!container) {
  throw new Error(
    'Root element with id "root" not found — make sure index.html contains <div id="root"></div>',
  );
}

createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3} preventDuplicate>
        <AuthProvider>
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
