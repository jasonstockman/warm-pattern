import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Wrapper component for routes that require authentication
 * Redirects to login page if the user is not authenticated
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/auth'
}) => {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const isLoading = auth.isLoading;
  
  // Show a loading indicator while checking authentication status
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Render the protected content if authenticated
  return <>{children}</>;
};

export default PrivateRoute; 