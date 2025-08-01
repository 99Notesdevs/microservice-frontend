"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode, type JSX } from "react"
import { env } from "../config/env"
import { useNavigate } from "react-router-dom"

interface User {
  id: string | number
  email: string
  name?: string
  // Add other user properties as needed
}

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthContextType {
  user: User | null;
  admin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string, secretKey: string) => Promise<void>;
  logout: () => void;
  GoogleOneTap: () => JSX.Element | null;
  checkAdmin: () => Promise<boolean>;
  fetchUserData: (token: string) => Promise<User | null>;
  fetchUserDetails: (token: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin first
        const isAdmin = await checkAdminStatus();
        if (isAdmin) {
          setAdmin(true);
          setIsLoading(false);
          return;
        }

        // If not admin, check regular user
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          localStorage.setItem("userId", userData.id.toString());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`${env.API_MAIN}/admin/check`, {
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      console.error("Admin check failed:", error);
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${env.API_MAIN}/user`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };
  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${env.API_MAIN}/user/validate`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_MAIN}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const userData = await fetchUserData();

      if (!userData) {
        throw new Error("Failed to fetch user data");
      }

      setUser(userData);
      localStorage.setItem("userId", userData.id.toString());
      console.log("login successfull!!!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string, secretKey: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_MAIN}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, secretKey }),
      });

      if (!response.ok) {
        throw new Error("Admin login failed");
      }

      // const data = await response.json();
      // const token = data.data.token;

      // Cookies.set("token", token, { expires: 7 });
      const isAdmin = await checkAdminStatus();

      if (!isAdmin) {
        throw new Error("Not authorized as admin");
      }
      console.log("admin login successfull!!!1");
      setAdmin(true);
      console.log("admin login successfull!!!2");
      navigate("/admin/permissions");
      console.log("admin login successfull!!!3");
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUser(null);
    setAdmin(false);
    window.location.href = `${env.MAIN_PORTAL_API}/login`;
  };

  const logout = async () => {
    try {
      await fetch(`${env.API_MAIN}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      handleLogout();
    }
  };

  const checkAdmin = async () => {
    return checkAdminStatus();
  };

  // Google OAuth implementation
  const GoogleOneTap = () => {
    useEffect(() => {
      if (!window.google || !env.REACT_APP_GOOGLE_CLIENT_ID) return;

      window.google.accounts.id.initialize({
        client_id: env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const res = await fetch(`${env.API_MAIN}/user/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: response.credential }),
            });

            const data = await res.json();
            if (data.success) {
            
              
              const userData = await fetchUserData();
              if (userData) {
                setUser(userData);
                localStorage.setItem("userId", userData.id.toString());
                navigate("/dashboard", { replace: true });
              }
            }
          } catch (error) {
            console.error("Google login failed:", error);
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
      });

      window.google.accounts.id.prompt();
      
      return () => {
        // Cleanup if needed
      };
    }, []);

    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isAuthenticated: !!user || admin,
        isLoading,
        login,
        adminLogin,
        logout,
        GoogleOneTap,
        checkAdmin,
        fetchUserData,
        fetchUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}