import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import { useAuth } from "./context/AuthContext";

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (token || user) {
    return children;
  }

  return <Navigate to="/login" replace/>;
};

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route
        path="/products"
        element={
          <RequireAuth>
            <ProductsPage/>
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/products" replace/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}
