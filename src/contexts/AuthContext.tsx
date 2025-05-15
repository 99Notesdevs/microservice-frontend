// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../config/env';
import Cookies from 'js-cookie';
type User = {
  isPaid: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
  checkPaid: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Replace with your actual API call to check auth status
      const response = await fetch(`${env.API_MAIN}/user/check`, {
        headers:{'Authorization': `Bearer ${Cookies.get('token')}`}
      });
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };
  const checkPaid = async (): Promise<boolean> => {
    try {
      // Replace with your actual API call to check auth status
      const response = await fetch(`${env.API_MAIN}/user/validate`, {
        headers:{'Authorization': `Bearer ${Cookies.get('token')}`}
      });
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${env.API_MAIN}/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','Accept': 'application/json', },
        body: JSON.stringify({ email, password }),
      });
      console.log('response',response);
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (!data.data) {
        throw new Error('No token received from server');
      }

      // Store the token in cookies
      const token = data.data.split(' ')[1];
      Cookies.set('token', token, { expires: 5 }); // 5 days
      // Get user data
const userData = await fetch(`${env.API_MAIN}/user`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!userData.ok) {
  throw new Error('Failed to fetch user data');
}

const userDataJson = await userData.json();
const userId = userDataJson.data.id;

// Store user ID in localStorage (more secure than cookies for this purpose)
localStorage.setItem('userId', userId);

// Continue with validation
const validateResponse = await fetch(`${env.API_MAIN}/user/validate`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
      console.log('validateResponse',validateResponse);
      console.log(validateResponse.ok);
      if (validateResponse.status === 200) {
        // User is paid
        setUser({ isPaid: true });
        console.log('user',user);
        navigate('/dashboard');
      } else {
        // User exists but not paid
        const redirectUrl = new URL('/subscription', env.MAIN_PORTAL_API);
        // redirectUrl.searchParams.set('token', token);
        window.location.href = redirectUrl.toString();
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clean up on error
      Cookies.remove('token');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${env.API_MAIN}/user/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth, checkPaid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};