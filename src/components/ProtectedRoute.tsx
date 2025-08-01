import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { env } from '../config/env';
export const ProtectedRoute = ({ 
  requirePaid = false, 
  allowedRoles: allowedRolesProp = ['user'], 
  children 
}: { 
  requirePaid?: boolean, 
  allowedRoles?: ('admin' | 'user')[],
  children: React.ReactNode 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Only check admin status if the route requires admin access
      if (allowedRolesProp.includes('admin')) {
        const adminStatus = await checkAdmin();
        setIsAdmin(adminStatus);

        // If user is admin and trying to access admin routes, no need to check paid status
        if (adminStatus) {
          return;
        }
      } else {
        // For user routes, ensure admin status is false
        setIsAdmin(false);
      }

      // For non-admin users or admin accessing user routes, check authentication and paid status
      if (!isAuthenticated) return;

      const paidStatus = await checkPaid();
      setIsPaid(paidStatus);
    };

    verifyAuth();
  }, [isAuthenticated, allowedRolesProp]);

  const checkAdmin = async () => {
    try {
      const response = await fetch(`${env.API_MAIN}/admin/check`, {
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      console.error('Admin check failed:', error);
      return false;
    }
  };

  const checkPaid = async () => {
    try {
      const response = await fetch(`${env.API_MAIN}/user/validate`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error('Failed to validate user status:', response.statusText);
        return false;
      }
      
      const data = await response.json();
      return data?.data?.paidUser || false;
    } catch (error) {
      console.error('Paid status check failed:', error);
      return false;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If route requires admin access and user is admin, allow access
  if (allowedRolesProp.includes('admin') && isAdmin) {
    return <>{children}<Outlet /></>;
  }

  // For non-admin routes, check authentication
  if (!isAuthenticated) { 
    window.location.href = `${env.MAIN_PORTAL_API}/users/login`;
  }

  // Check if user has required role for non-admin routes
  if (!allowedRolesProp.includes('admin') && !isAuthenticated) {
    window.location.href = `${env.MAIN_PORTAL_API}/users/login`;
  }

  // If route requires paid access and user hasn't paid, show subscription prompt
  if (requirePaid && isPaid === false) {
    return <Navigate to="/subscription" />;
  }

  return (
    <>
      {children}
      <Outlet />
    </>
  );
};