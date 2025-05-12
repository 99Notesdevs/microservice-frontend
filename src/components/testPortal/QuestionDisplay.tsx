import type React from "react"
import type { Question } from "../../types/testTypes"

interface QuestionDisplayProps {
  question: Question
  selectedOption: number | null
  onOptionSelect: (optionIndex: number) => void
  onConfirmAnswer: () => void
  onSaveForLater: () => void
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  onConfirmAnswer,
  onSaveForLater,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Question {question.id}</h2>
        <p className="text-gray-800">{question.text}</p>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedOption === index ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => onOptionSelect(index)}
          >
            <div className="flex items-start">
              <div
                className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                  selectedOption === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}
              >
                {selectedOption === index && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <span>{option}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onConfirmAnswer}
          disabled={selectedOption === null}
        >
          Confirm Answer
        </button>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          onClick={onSaveForLater}
        >
          Save for Later
        </button>
      </div>
    </div>
  )
}

export default QuestionDisplay
