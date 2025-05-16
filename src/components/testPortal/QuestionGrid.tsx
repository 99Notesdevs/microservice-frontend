"use client"

import React from "react"
import type { Question, QuestionStatus } from "../../types/testTypes"
import { cn } from "../../lib/utils"

type QuestionGridProps = {
  questions: Question[]
  statuses: QuestionStatus[]
  currentIndex: number
  onQuestionSelect: (index: number) => void
  isReviewMode?: boolean
  correctAnswers?: Record<string, string[]>
  selectedAnswers: (number | null | number[] | null)[]
}

const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  statuses,
  currentIndex,
  onQuestionSelect,
  isReviewMode = false,
  correctAnswers,
  selectedAnswers,
}) => {
  const getStatusColor = (index: number, status: QuestionStatus, isActive: boolean) => {
    if (isActive) return "ring-2 ring-blue-500 ring-offset-2"

    if (isReviewMode) {
      // Get the correct answer and selected answer for this question
      const correctAnswer = correctAnswers?.[questions[index].id]
      const selectedAnswer = selectedAnswers[index]

      // Determine the status based on correctness
      if (status === "NOT_VISITED") {
        return "bg-gray-300"
      } else if (status === "ANSWERED") {
        if (selectedAnswer === null) {
          return "bg-gray-300" // Not answered
        } else if (Array.isArray(selectedAnswer) && Array.isArray(correctAnswer)) {
          // Multiple answer case
          const correctCount = selectedAnswer.filter(answer => correctAnswer.includes(answer.toString())).length
          if (correctCount === correctAnswer.length) {
            return "bg-green-500 text-white" // All correct
          } else if (correctCount > 0) {
            return "bg-yellow-500 text-white" // Partially correct
          } else {
            return "bg-red-500 text-white" // All wrong
          }
        } else {
          // Single answer case
          return selectedAnswer?.toString() === correctAnswer?.[0] 
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }
      } else if (status === "SAVED_FOR_LATER") {
        return "bg-yellow-500 text-white" // Saved for later
      } else {
        return "bg-blue-500 text-white" // Visited
      }
    }

    // For normal mode, keep the existing colors
    switch (status) {
      case "NOT_VISITED":
        return "bg-gray-300"
      case "VISITED":
        return "bg-red-500 text-white"
      case "SAVED_FOR_LATER":
        return "bg-purple-500 text-white"
      case "ANSWERED":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((_, index) => (
        <button
          key={index}
          onClick={() => onQuestionSelect(index)}
          className={cn(
            "w-full aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all",
            getStatusColor(index, statuses[index], index === currentIndex),
          )}
          aria-label={`Question ${index + 1}`}
          aria-current={index === currentIndex ? "true" : "false"}
        >
          {index + 1}
        </button>
      ))}
    </div>
  )
}

export default React.memo(QuestionGrid)
