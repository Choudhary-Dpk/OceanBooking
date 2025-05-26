import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSessionValid } from '../utils/sessionUtils';
import { message } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Check session validity on route change
    if (!isSessionValid()) {
      message.info('Your session has expired. Please log in again.');
    }
  }, [location]);

  if (!isSessionValid()) {
    // Redirect to home if session is invalid
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 