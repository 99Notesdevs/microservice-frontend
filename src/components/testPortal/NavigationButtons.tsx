import type React from "react"

interface NavigationButtonsProps {
  currentIndex: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ currentIndex, totalQuestions, onNext, onPrevious }) => {
  return (
    <div className="flex justify-between mt-6">
      <button
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        Previous
      </button>

      <div className="text-center py-2">
        <span className="font-medium">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      <button
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
      >
        Next
      </button>
    </div>
  )
}

export default NavigationButtons
