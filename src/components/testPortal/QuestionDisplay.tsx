"use client"

import type React from "react"
import { Flag, CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import type { Question } from "../../types/testTypes"

interface QuestionDisplayProps {
  question: Question
  selectedOptions: number[]
  onOptionSelect: (questionId: number, optionIndex: number) => void
  onConfirmAnswer: () => void
  onSaveForLater: () => void
  isReviewMode: boolean
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOptions,
  onOptionSelect,
  onConfirmAnswer,
  onSaveForLater,
  isReviewMode,
}) => {
  // Parse correct answers
  const correctAnswers = question.answer.split(",").map(Number)

  // Determine if this is a multiple choice question
  const isMultipleChoice = question.multipleCorrectType

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="flex items-start">
          <div className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm mr-3">
            Q{question.id}
          </div>
          <div>
            {question.pyq && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                Previous Year
              </span>
            )}
            {question.year && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {question.year}
              </span>
            )}
          </div>
        </div>

        {isMultipleChoice && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Multiple Correct
          </span>
        )}
      </div>

      <div className="mb-6">
      <p 
  className="text-gray-800 text-lg" 
  dangerouslySetInnerHTML={{ __html: question.question }} 
/>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index)
          const isCorrect = correctAnswers.includes(index)

          // Determine styling based on mode and correctness
          let optionClass = "p-4 border rounded-lg transition-colors "

          if (isReviewMode) {
            if (isSelected && isCorrect) {
              optionClass += "border-green-500 bg-green-50"
            } else if (isSelected && !isCorrect) {
              optionClass += "border-red-500 bg-red-50"
            } else if (!isSelected && isCorrect) {
              optionClass += "border-green-500 bg-green-50 opacity-70"
            } else {
              optionClass += "border-gray-200 hover:bg-gray-50"
            }
          } else {
            optionClass += isSelected
              ? "border-blue-500 bg-blue-50 cursor-pointer"
              : "border-gray-200 hover:bg-gray-50 cursor-pointer"
          }

          const optionLabel = String.fromCharCode(65 + index) // A, B, C, D...

          return (
            <div
              key={index}
              className={optionClass}
              onClick={() => !isReviewMode && onOptionSelect(question.id, index)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                      isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 text-gray-600"
                    }`}
                  >
                    {optionLabel}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p 
  className="text-gray-800 text-lg" 
  dangerouslySetInnerHTML={{ __html: option }} 
/>
                </div>
                {isReviewMode && (
                  <div className="flex-shrink-0 ml-3">
                    {isSelected && isCorrect && <CheckCircle className="text-green-500 w-5 h-5" />}
                    {isSelected && !isCorrect && <AlertCircle className="text-red-500 w-5 h-5" />}
                    {!isSelected && isCorrect && <CheckCircle className="text-green-500 w-5 h-5 opacity-70" />}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isReviewMode && (question.explaination || question.explanation) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-yellow-600" />
            Explanation
          </h3>
          <p 
            className="text-gray-800 text-lg" 
            dangerouslySetInnerHTML={{ __html: question.explaination || question.explanation || "" }} 
          />
        </div>
      )}

      {!isReviewMode && (
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            onClick={onConfirmAnswer}
            disabled={selectedOptions.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save & Next
          </button>
          <button
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center"
            onClick={onSaveForLater}
          >
            <Flag className="w-4 h-4 mr-2" />
            Mark for Review
          </button>
        </div>
      )}

      {question.creatorName && <div className="mt-4 text-sm text-gray-500">Created by: {question.creatorName}</div>}
    </div>
  )
}

export default QuestionDisplay
