"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"
import { env } from "../config/env"
import { Socket } from "socket.io-client"

interface SocketContextType {
  socket: typeof Socket | null
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<typeof Socket | null>(null)
    const { userId, isAuthenticated } = useAuth()
  
    useEffect(() => {
        let socketInstance: typeof Socket | null = null
      
        // Only connect if the user is authenticated and we don't already have a socket
        if (isAuthenticated && userId && !socket) {
          console.log("Establishing persistent socket connection for user:", userId)
      
          socketInstance = io(env.SOCKET_URL, {
            path: "/socket.io",
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket"],
            forceNew: false,
          })
      
          socketInstance.on("connect", () => {
            console.log("Socket connected successfully with ID:", socketInstance?.id)
            socketInstance?.emit("join_room", JSON.stringify({ userId: userId }))
            console.log("User joined room:", userId)
            console.log("Socket instance before set:", socketInstance)
            
            // Set the socket only after it's fully connected
            setSocket(socketInstance)
          })
      
          socketInstance.on("connect_error", (error: any) => {
            console.error("Socket connection error:", error)
          })
      
          socketInstance.on("disconnect", (reason: any) => {
            console.log("Socket disconnected:", reason)
          })
        }
      
        // Clean up function will only run when component unmounts or user logs out
        return () => {
          if (socketInstance) {
            console.log("Cleaning up socket connection on unmount or logout")
            socketInstance.disconnect()
            setSocket(null)
          }
        }
      }, [isAuthenticated, userId, socket])  // Add socket to dependencies
  
    // Add this useEffect to monitor socket state changes
    useEffect(() => {
      console.log("Socket state updated:", socket?.id)
      if (socket) {
        console.log("Socket instance is now available in state")
        console.log("Socket type:", typeof socket)
        console.log("Socket methods available:", Object.keys(socket))
        console.log("Socket instance:", socket)
      }
    }, [socket])
  
    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  }