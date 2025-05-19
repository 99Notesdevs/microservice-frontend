"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

interface PrivateRouteProps {
  element: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = async ({ element }) => {
  const { checkAuth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const isAuthenticated = await checkAuth()
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" replace />
}

export default PrivateRoute
