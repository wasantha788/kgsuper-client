// DeliveryProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const DeliveryProtectedRoute = () => {
  const { isdelivery } = useAppContext();

  if (isdelivery === null) {
    // optional: loading spinner while checking auth
    return <div>Loading...</div>;
  }

  return isdelivery ? <Outlet /> : <Navigate to="/delivery-login" replace />;
};

export default DeliveryProtectedRoute;
