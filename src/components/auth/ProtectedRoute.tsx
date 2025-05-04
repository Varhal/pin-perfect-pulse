
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireAuth = true,
}) => {
  const { user, loading } = useAuth();
  
  // Show nothing while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pinterest-red"></div>
      </div>
    );
  }

  // For protected routes (dashboard): redirect to auth if not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // For public routes (auth, landing): redirect to dashboard if logged in
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
