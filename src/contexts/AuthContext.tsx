// // src/contexts/AuthContext.tsx
// import { createContext, useContext, useState, useEffect } from 'react';
// import type { ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { env } from '../config/env';
// import Cookies from 'js-cookie';
// type User = {
//   isPaid: boolean;
// };

// type AuthContextType = {
//   user: User | null;
//   userId: number | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
//   checkAuth: () => Promise<boolean>;
//   checkPaid: () => Promise<boolean>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [userId, setUserId] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async (): Promise<boolean> => {
//     try {
//       // Replace with your actual API call to check auth status
//       const response = await fetch(`${env.API_MAIN}/user/check`, {
//         headers:{'Authorization': `Bearer ${Cookies.get('token')}`}
//       });
//       if (response.ok) {
//         return true;
//       }
//       return false;
//     } catch (error) {
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };
//   const checkPaid = async (): Promise<boolean> => {
//     try {
//       // Replace with your actual API call to check auth status
//       const response = await fetch(`${env.API_MAIN}/user/validate`, {
//         headers:{'Authorization': `Bearer ${Cookies.get('token')}`}
//       });
//       if (response.ok) {
//         return true;
//       }
//       return false;
//     } catch (error) {
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch(`${env.API_MAIN}/user/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json','Accept': 'application/json', },
//         body: JSON.stringify({ email, password }),
//       });
//       console.log('response',response);
//       if (!response.ok) {
//         throw new Error('Login failed');
//       }

//       const data = await response.json();
      
//       if (!data.data) {
//         throw new Error('No token received from server');
//       }

//       // Store the token in cookies
//       const token = data.data.split(' ')[1];
//       Cookies.set('token', token, { expires: 5 }); // 5 days
//       // Get user data
// const userData = await fetch(`${env.API_MAIN}/user`, {
//   headers: { 'Authorization': `Bearer ${token}` }
// });

// if (!userData.ok) {
//   throw new Error('Failed to fetch user data');
// }

// const userDataJson = await userData.json();
// const userId = userDataJson.data.id;
// setUserId(userId);
// // Store user ID in localStorage (more secure than cookies for this purpose)
// localStorage.setItem('userId', userId);

// // Continue with validation
// const validateResponse = await fetch(`${env.API_MAIN}/user/validate`, {
//   headers: { 'Authorization': `Bearer ${token}` }
// });
//       console.log('validateResponse',validateResponse);
//       console.log(validateResponse.ok);
//       if (validateResponse.status === 200) {
//         // User is paid
//         setUser({ isPaid: true });
//         console.log('user',user);
//         navigate('/dashboard');
//       } else {
//         // User exists but not paid
//         const redirectUrl = new URL('/subscription', env.MAIN_PORTAL_API);
//         // redirectUrl.searchParams.set('token', token);
//         window.location.href = redirectUrl.toString();
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       // Clean up on error
//       Cookies.remove('token');
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await fetch(`${env.API_MAIN}/user/logout`, { method: 'POST' });
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//       navigate('/login');
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user,userId,isAuthenticated:!!userId, login, logout, loading, checkAuth, checkPaid }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // "use client"

// // import type React from "react"
// // import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
// // import Cookies from "js-cookie"
// // import { env } from "../config/env"

// // // interface User {
// // //   id: string | number
// // //   email: string
// // //   name?: string
// // //   // Add other user properties as needed
// // // }

// // interface AuthContextType {
// //   userId: number | null
// //   isAuthenticated: boolean
// //   isLoading: boolean
// //   login: (email: string, password: string) => Promise<void>
// //   logout: () => void
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined)

// // export const useAuth = () => {
// //   const context = useContext(AuthContext)
// //   if (!context) {
// //     throw new Error("useAuth must be used within an AuthProvider")
// //   }
// //   return context
// // }

// // interface AuthProviderProps {
// //   children: ReactNode
// // }

// // export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
// //   const [userId, setUserId] = useState<number | null>(null)
// //   const [isLoading, setIsLoading] = useState(true)

// //   // Check if user is already logged in on mount
// //   useEffect(() => {
// //     const checkAuth = async () => {
// //       const token = Cookies.get("token")
// //       if (token) {
// //         try {
// //           // Fetch user data
// //           const response = await fetch(`${env.API_MAIN}/user/check`, {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //           })

// //           if (response.ok) {
// //             const userId = localStorage.getItem("userId")
// //             if (userId) {
// //               setUserId(Number(userId))
// //             }
// //           } else {
// //             // Token is invalid or expired
// //             Cookies.remove("token")
// //             localStorage.removeItem("userId")
// //           }
// //         } catch (error) {
// //           console.error("Auth check failed:", error)
// //         }
// //       }
// //       setIsLoading(false)
// //     }

// //     checkAuth()
// //   }, [])

// //   const login = async (email: string, password: string) => {
// //     setIsLoading(true)
// //     try {
// //       const response = await fetch(`${env.API_MAIN}/user`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ email, password }),
// //       })

// //       if (!response.ok) {
// //         throw new Error("Login failed")
// //       }

// //       const data = await response.json()
// //       const token = data.data.split(' ')[1];
// //       Cookies.set('token', token, { expires: 5 }); // 5 days
// //       const userData = await fetch(`${env.API_MAIN}/user`, {
// //         headers: { 'Authorization': `Bearer ${token}` }
// //       });

// //       if (!userData.ok) {
// //         throw new Error('Failed to fetch user data');
// //       }

// //       const userDataJson = await userData.json();
// //       const userId = userDataJson.data.id;

// //       // Store user ID in localStorage (more secure than cookies for this purpose)
// //       localStorage.setItem('userId', userId);

// //       setUserId(userId)
// //       setIsLoading(false)
// //     } catch (error) {
// //       setIsLoading(false)
// //       throw error
// //     }
// //   }

// //   const logout = () => {
// //     // Remove token and user data
// //     Cookies.remove("token")
// //     localStorage.removeItem("userId")
// //     setUserId(null)
// //   }

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         userId,
// //         isAuthenticated: !!userId,
// //         isLoading,
// //         login,
// //         logout,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   )
// // }
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import Cookies from "js-cookie"
import { env } from "../config/env"
import { useNavigate } from "react-router-dom"
interface User {
  id: string | number
  email: string
  name?: string
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();
  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token")
      if (token) {
        try {
          // Fetch user data
          const response = await fetch(`${env.API_MAIN}/user/validate`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data) {
              setUser(userData.data);
                localStorage.setItem("userId", userData.data.id.toString())

              console.log("User data:", userData.data);
            }
          } else {
            // Token is invalid or expired
            navigate('/login')
            Cookies.remove("token")
            localStorage.removeItem("userId")
          }
        } catch (error) {
          console.error("Auth check failed:", error)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_MAIN}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const token = data.data.split(' ')[1];
      
      // Save token to cookies
      Cookies.set("token", token, { expires: 7 }); // 7 days expiry

      // Fetch user data
      const userData = await fetch(`${env.API_MAIN}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userData.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userDataJson = await userData.json();
      
      if (!userDataJson.data) {
        throw new Error('Invalid user data received');
      }

      const user = {
        id: userDataJson.data.id,
        email: userDataJson.data.email,
        name: userDataJson.data.name
      };

      // Update user state before navigation
      setUser(user);
      localStorage.setItem('userId', user.id.toString());
      
      // Navigate to dashboard after successful login and state update
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  const logout = async () => {
    try {
      const response = await fetch(`${env.API_MAIN}/user/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if the API call fails
    } finally {
      // Always clean up and redirect
      Cookies.remove("token");
      localStorage.removeItem("userId");
      setUser(null);
      navigate('/login');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}