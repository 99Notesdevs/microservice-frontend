import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { env } from '../config/env';
import { SubscriptionPrompt } from './SubscriptionPrompt';

export const ProtectedRoute = ({ requirePaid = false, children }: { requirePaid?: boolean, children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
    //   _const authStatus = isAuthenticated;
      const paidStatus = isAuthenticated;
      setIsPaid(paidStatus);
    };
    verifyAuth();
  }, [isAuthenticated]);

  const handleSubscribe = () => {
    window.location.href = `${env.MAIN_PORTAL_API}/subscription`;
  };

  if (isLoading || isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requirePaid && isPaid === false) {
    return <SubscriptionPrompt onSubscribe={handleSubscribe} />;
  }

  return (
    <>
      {children}
      <Outlet />
    </>
  );
};