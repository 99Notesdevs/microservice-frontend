import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { env } from '../config/env';
import { SubscriptionPrompt } from './SubscriptionPrompt';

export const ProtectedRoute = ({ requirePaid = false }: { requirePaid?: boolean }) => {
  const { loading, checkAuth, checkPaid } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      const paidStatus = await checkPaid();
      setIsAuthenticated(authStatus);
      setIsPaid(paidStatus);
    };
    verifyAuth();
  }, [checkAuth, checkPaid]);

  const handleSubscribe = () => {
    window.location.href = `${env.MAIN_PORTAL_API}/subscription`;
  };

  if (loading || isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requirePaid && isPaid === false) {
    return <SubscriptionPrompt onSubscribe={handleSubscribe} />;
  }

  return <Outlet />;
};