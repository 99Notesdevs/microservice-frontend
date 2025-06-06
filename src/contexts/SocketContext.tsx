"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import io, { Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"
import { env } from "../config/env"

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
  const { user, isAuthenticated } = useAuth()

  // Replace the useEffect hook with this more stable version
  // This will prevent the socket from reconnecting unnecessarily

  useEffect(() => {
    let socketInstance: typeof Socket | null = null

    // Only connect if the user is authenticated and we don't already have a socket
    if (isAuthenticated && user?.id) {
      console.log("Establishing persistent socket connection for user:", user.id)

      socketInstance = io(env.SOCKET_URL, {
        path: "/socket.io",
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        // Add this to prevent multiple connections
        transports: ["websocket"],
        forceNew: false,
      })

      socketInstance.on("connect", () => {
        console.log("Socket connected successfully with ID:", socketInstance?.id)
        // Join user's room
        socketInstance?.emit("join_room", JSON.stringify({ userId: user.id }))
      })

      socketInstance.on("connect_error", (error: any) => {
        console.error("Socket connection error:", error)
      })

      socketInstance.on("disconnect", (reason: any) => {
        console.log("Socket disconnected:", reason)
      })

      setSocket(socketInstance)
    }

    // Clean up function will only run when component unmounts or user logs out
    return () => {
      if (socketInstance) {
        console.log("Cleaning up socket connection on unmount or logout")
        socketInstance.disconnect()
        setSocket(null)
      }
    }
  }, [isAuthenticated, user?.id]) // Only depend on auth state and user ID

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}
