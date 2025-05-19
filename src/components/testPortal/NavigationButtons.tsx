"use client"

import type React from "react"
import { ChevronLeft, ChevronRight, Save, Flag } from "lucide-react"

interface NavigationButtonsProps {
  currentIndex: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
  onSaveAndNext?: () => void
  onMarkForReview?: () => void
  isReviewMode?: boolean
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onSaveAndNext,
  onMarkForReview,
  isReviewMode = false,
}) => {
  return (
    <div className="flex justify-between items-center mt-6 bg-gray-50 p-3 rounded-lg">
      <button
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </button>

      <div className="text-center py-2">
        <span className="font-medium">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {!isReviewMode && onSaveAndNext && onMarkForReview && (
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center"
            onClick={onMarkForReview}
          >
            <Flag className="w-4 h-4 mr-1" />
            Mark for Review
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            onClick={onSaveAndNext}
          >
            <Save className="w-4 h-4 mr-1" />
            Save & Next
          </button>
        </div>
      )}

      <button
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  )
}

export default NavigationButtons
