import type React from "react"
import { type Question, QuestionStatus } from "../../types/testTypes"

interface QuestionGridProps {
  questions: Question[]
  statuses: QuestionStatus[]
  currentIndex: number
  onQuestionSelect: (index: number) => void
}

const QuestionGrid: React.FC<QuestionGridProps> = ({ questions, statuses, currentIndex, onQuestionSelect }) => {
  // Function to determine button color based on status
  const getButtonColor = (status: QuestionStatus, isActive: boolean) => {
    if (isActive) {
      return "ring-2 ring-blue-500 ring-offset-2"
    }

    switch (status) {
      case QuestionStatus.NOT_VISITED:
        return "bg-gray-300 hover:bg-gray-400"
      case QuestionStatus.VISITED:
        return "bg-red-500 hover:bg-red-600 text-white"
      case QuestionStatus.SAVED_FOR_LATER:
        return "bg-purple-500 hover:bg-purple-600 text-white"
      case QuestionStatus.ANSWERED:
        return "bg-green-500 hover:bg-green-600 text-white"
      default:
        return "bg-gray-300 hover:bg-gray-400"
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {questions.map((question, index) => (
        <button
          key={index}
          className={`w-full h-10 rounded-md font-medium transition-colors ${getButtonColor(statuses[index], index === currentIndex)}`}
          onClick={() => onQuestionSelect(index)}
          aria-label={`Question ${index + 1}`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  )
}

export default QuestionGrid
