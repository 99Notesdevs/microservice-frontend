"use client"

import React, { useState, useEffect } from "react"
import { Clock } from "lucide-react"

type TimerProps = {
  initialTime: number // in seconds
  onTimeEnd: () => void
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeEnd()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeEnd])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getColorClass = () => {
    if (timeLeft < 60) return "text-red-600"
    if (timeLeft < 300) return "text-amber-600"
    return "text-green-600"
  }

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold ${getColorClass()}`}>
      <Clock className="h-5 w-5" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}

export default React.memo(Timer)
