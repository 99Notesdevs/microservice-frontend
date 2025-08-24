import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { env } from '../config/env';
import { useUser } from '../contexts/UserContext';

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
  const { openUserModal } = useUser();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);

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
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
        return;
      }

      const paidStatus = await checkPaid();
      setIsPaid(paidStatus);
    };

    verifyAuth();
  }, [isAuthenticated, allowedRolesProp]);

  const handleLoginClick = () => {
    openUserModal('login');
  };

  const handleClose = () => {
    setShowLoginPrompt(false);
  };

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
      const response = await fetch(`${env.API_AUTH}/user/validate`, {
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

  // Show login prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="mb-6 text-gray-600">You need to be logged in to view this content.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
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