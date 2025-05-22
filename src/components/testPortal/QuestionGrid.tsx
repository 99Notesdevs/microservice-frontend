"use client"

import type React from "react"
import { type Question, QuestionStatus, type UserAnswer } from "../../types/testTypes"

interface QuestionGridProps {
  questions: Question[]
  statuses: QuestionStatus[]
  currentIndex: number
  onQuestionSelect: (index: number) => void
  isReviewMode?: boolean
  answers?: UserAnswer[]
  compact?: boolean
}

const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  statuses,
  currentIndex,
  onQuestionSelect,
  isReviewMode = false,
  answers = [],
  compact = false,
}) => {
  // Function to determine button color based on status and review mode
  const getButtonColor = (status: QuestionStatus, index: number, isActive: boolean) => {
    const baseClasses = isActive ? "ring-2 ring-blue-500 ring-offset-1 " : ""

    if (isReviewMode) {
      const answer = answers.find((a) => a.questionId === questions[index].id)

      if (answer) {
        if (answer.isCorrect) {
          return baseClasses + "bg-green-500 hover:bg-green-600 text-white"
        } else if (answer.isPartiallyCorrect) {
          return baseClasses + "bg-yellow-500 hover:bg-yellow-600 text-white"
        } else if (answer.selectedOptions.length > 0) {
          return baseClasses + "bg-red-500 hover:bg-red-600 text-white"
        }
      }

      return baseClasses + "bg-gray-300 hover:bg-gray-400"
    }

    switch (status) {
      case QuestionStatus.NOT_VISITED:
        return baseClasses + "bg-gray-300 hover:bg-gray-400"
      case QuestionStatus.VISITED:
        return baseClasses + "bg-red-500 hover:bg-red-600 text-white"
      case QuestionStatus.SAVED_FOR_LATER:
        return baseClasses + "bg-amber-500 hover:bg-amber-600 text-white"
      case QuestionStatus.ANSWERED:
        return baseClasses + "bg-green-500 hover:bg-green-600 text-white"
      default:
        return baseClasses + "bg-gray-300 hover:bg-gray-400"
    }
  }

  const gridCols = compact ? "grid-cols-8 md:grid-cols-5 gap-1 md:gap-2" : "grid-cols-8 md:grid-cols-5 gap-2 md:gap-3"
  const buttonSize = compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"

  return (
    <div className={`grid ${gridCols}`}>
      {questions.map((question, index) => {
        const isMultipleChoice = question.multipleCorrectType

        return (
          <button
            key={index}
            className={`${buttonSize} rounded-md font-medium transition-colors ${getButtonColor(
              statuses[index],
              index,
              index === currentIndex,
            )}`}
            onClick={() => onQuestionSelect(index)}
            aria-label={`Question ${index + 1}`}
          >
            <div className="flex items-center justify-center">
              <span>{index + 1}</span>
              {isMultipleChoice && <span className="text-[8px] ml-0.5">*</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default QuestionGrid
