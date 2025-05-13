import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { env } from '../config/env';

export const ProtectedRoute = ({ requirePaid = false }: { requirePaid?: boolean }) => {
  const { user, loading, checkAuth, checkPaid } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      const paidStatus = await checkPaid();
      setIsAuthenticated(authStatus && paidStatus);
    };
    verifyAuth();
  }, [checkAuth, checkPaid]);

  if (loading || isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requirePaid && !user?.isPaid) {
    // Redirect to external subscription page
    window.location.href = `${env.MAIN_PORTAL_API}/subscription`;
    return null; // Return null while redirecting
  }

  return <Outlet />;
};