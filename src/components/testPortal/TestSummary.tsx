"use client"

import React from "react"
import { Button } from "../ui/button"
import { Clock, Award, BarChart } from "lucide-react"

type TestSummaryProps = {
  score: number
  totalQuestions: number
  timeTaken: number
  onRetake: () => void
  onFinish: () => void
}

const TestSummary: React.FC<TestSummaryProps> = ({ score, totalQuestions, timeTaken, onRetake, onFinish }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const parts = []
    if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`)
    if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs} sec${secs !== 1 ? "s" : ""}`)

    return parts.join(" ")
  }

  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <div className="mb-6 bg-white shadow-sm rounded-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Test Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Award className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Score</p>
              <p className="text-xl font-bold">
                {score} / {totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <BarChart className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Percentage</p>
              <p className="text-xl font-bold">{percentage}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Time Taken</p>
              <p className="text-xl font-bold">{formatTime(timeTaken)}</p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">
          Review your answers below. Correct answers are highlighted in green, and incorrect answers are highlighted in
          red.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onRetake} variant="outline">
            Retake Test
          </Button>
          <Button onClick={onFinish}>Finish Review</Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(TestSummary)
