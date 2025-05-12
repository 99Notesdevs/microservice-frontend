import type React from "react"
import { useState, useEffect } from "react"

interface TimerProps {
  initialTime: number // in seconds
  onTimeEnd: () => void
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeEnd }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          onTimeEnd()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onTimeEnd])

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Determine color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining < 60) return "text-red-600" // Less than 1 minute
    if (timeRemaining < 300) return "text-orange-500" // Less than 5 minutes
    return "text-green-600"
  }

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-gray-600 mb-1">Time Remaining</div>
      <div className={`text-2xl font-bold ${getTimerColor()}`}>{formatTime(timeRemaining)}</div>
    </div>
  )
}

export default Timer
