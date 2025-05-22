"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Clock, Maximize, Minimize, User, FileText } from "lucide-react"
import { formatTime } from "../../lib/formatTime"

interface FullScreenHeaderProps {
  testName: string
  userName?: string
  remainingTime: number
  questionCount: number
  answeredCount: number
  toggleFullScreen: () => void
  isFullScreen: boolean
}

const FullScreenHeader: React.FC<FullScreenHeaderProps> = ({
  testName,
  userName = "Test Candidate",
  remainingTime,
  questionCount,
  answeredCount,
  toggleFullScreen,
  isFullScreen,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Format current time as HH:MM AM/PM
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (remainingTime < 300) return "text-red-600" // Less than 5 minutes
    if (remainingTime < 900) return "text-orange-500" // Less than 15 minutes
    return "text-green-600"
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="font-bold text-gray-800">{testName}</h1>
          <div className="flex items-center text-sm text-gray-500">
            <FileText size={14} className="mr-1" />
            <span>
              Questions: {questionCount} | Answered: {answeredCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <User size={16} className="mr-2 text-gray-500" />
          <span className="text-sm font-medium">{userName}</span>
        </div>

        <div className="flex items-center">
          <Clock size={16} className="mr-2 text-gray-500" />
          <span className="text-sm">{formattedTime}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Time Remaining</span>
          <span className={`font-bold ${getTimerColor()}`}>{formatTime(remainingTime)}</span>
        </div>

        <button
          onClick={toggleFullScreen}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
        >
          {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
    </header>
  )
}

export default FullScreenHeader
