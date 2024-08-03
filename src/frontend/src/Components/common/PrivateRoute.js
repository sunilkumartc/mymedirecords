import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if token exists
  const userType = localStorage.getItem('user_type'); // Get user_type from localStorage
  const location = useLocation(); // Get the current location

  // Redirect based on user role
  const redirectTo = userType === "patient" ? "/HomeDashboard" :
                     userType === "doctor" ? "/DoctorDashboard" :
                     "/login"; // Redirect to login for other or unauthenticated users

  return isAuthenticated ? (
    React.cloneElement(Component, { ...rest })
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} />
  );
};

export default PrivateRoute;
