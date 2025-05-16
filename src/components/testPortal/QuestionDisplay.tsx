"use client"

import React, { useState, useEffect } from "react"
import type { Question, QuestionStatus } from "../../types/testTypes"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

type QuestionDisplayProps = {
  question: Question
  selectedOption: number | null | string
  onOptionSelect: (optionIndex: number | string) => void
  onConfirmAnswer: () => void
  onSaveForLater: () => void
  currentQuestionIndex: number
  questions: Question[]
  isReviewMode?: boolean
  correctOption?: number | string | number[] | string[] | null
  status?: QuestionStatus
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  onConfirmAnswer,
  onSaveForLater,
  currentQuestionIndex,
  questions,
  isReviewMode = false,
  correctOption,
  status,
}) => {
  const [showAnswer, setShowAnswer] = useState(false)
  const [tempAnswer, setTempAnswer] = useState<number | null | string>(null)
  const [inputValue, setInputValue] = useState("")

  // Reset tempAnswer and inputValue when question changes
  useEffect(() => {
    setTempAnswer(selectedOption || null)
    if (question?.options.length === 0) {
      setInputValue(selectedOption?.toString() || "")
    } else {
      setInputValue("")
    }
  }, [currentQuestionIndex, selectedOption, question])

  if (!question) return null

  const getOptionClass = (index: number) => {
    // In review mode, show saved/confirmed answers
    if (isReviewMode) {
      if (status === "SAVED_FOR_LATER" || status === "ANSWERED") {
        if (selectedOption && typeof selectedOption === 'string') {
          const options = selectedOption.split(',');
          if (options.includes((index + 1).toString())) {
            return status === "SAVED_FOR_LATER" 
              ? "bg-yellow-50 border-yellow-300 text-yellow-800"
              : "bg-green-50 border-green-300 text-green-800";
          }
        } else if (selectedOption === index) {
          return status === "SAVED_FOR_LATER" 
            ? "bg-yellow-50 border-yellow-300 text-yellow-800"
            : "bg-green-50 border-green-300 text-green-800";
        }
      }
      return ""
    }

    // In normal mode, show tempAnswer highlighting
    if (tempAnswer && typeof tempAnswer === 'string') {
      const options = tempAnswer.split(',');
      if (options.includes((index + 1).toString())) {
        return "bg-blue-50 border border-blue-200"
      }
    } else if (tempAnswer === index) {
      return "bg-blue-50 border border-blue-200"
    }

    // Also show selectedOption in normal mode if it exists
    if (selectedOption && typeof selectedOption === 'string') {
      const options = selectedOption.split(',');
      if (options.includes((index + 1).toString())) {
        return "bg-blue-50 border border-blue-200"
      }
    } else if (selectedOption !== null && selectedOption === index) {
      return "bg-blue-50 border border-blue-200"
    }

    return ""
  }

  const handleOptionSelect = (index: number) => {
    if (question.multipleCorrectType) {
      const currentAnswers = tempAnswer ? tempAnswer.toString().split(',') : [];
      const newAnswers = currentAnswers.includes((index + 1).toString())
        ? currentAnswers.filter(a => a !== (index + 1).toString())
        : [...currentAnswers, (index + 1).toString()];
      setTempAnswer(newAnswers.join(','));
      onOptionSelect(newAnswers.join(','));
    } else {
      setTempAnswer(index);
      onOptionSelect(index);
    }
  }

  const handleIntegerAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setTempAnswer(value);
    onOptionSelect(value);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</h3>
          {isReviewMode && status && (
            <span className={cn(
              "px-2 py-1 rounded-full text-sm font-medium",
              {
                "bg-blue-100 text-blue-800": status === "VISITED",
                "bg-green-100 text-green-800": status === "ANSWERED",
                "bg-yellow-100 text-yellow-800": status === "SAVED_FOR_LATER",
                "bg-gray-100 text-gray-800": status === "NOT_VISITED"
              }
            )}>
              {status}
            </span>
          )}
        </div>
        <p>{question.multipleCorrectType ? "Multiple Correct" : "Single Correct"}</p>
        <p className="text-gray-700">{question.question}</p>
      </div>

      <div className="space-y-3">
        {question.options.length === 0 ? (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={handleIntegerAnswer}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your answer"
            />
          </div>
        ) : question.multipleCorrectType ? (
          question.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg cursor-pointer",
                getOptionClass(index),
                "hover:bg-gray-50",
                isReviewMode && "cursor-not-allowed"
              )}
              onClick={() => !isReviewMode && handleOptionSelect(index)}
            >
              <input
                type="checkbox"
                name={`question-${currentQuestionIndex}`}
                checked={getOptionClass(index) !== ""}
                readOnly={isReviewMode}
                className="hidden"
              />
              <div className="flex-1 text-gray-700">{option}</div>
            </div>
          ))
        ) : (
          question.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg cursor-pointer",
                getOptionClass(index),
                "hover:bg-gray-50",
                isReviewMode && "cursor-not-allowed"
              )}
              onClick={() => !isReviewMode && handleOptionSelect(index)}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                defaultChecked={getOptionClass(index) !== ""}
                readOnly={isReviewMode}
                className="hidden"
              />
              <div className="flex-1 text-gray-700">{option}</div>
            </div>
          ))
        )}
      </div>

      {isReviewMode && (
        <div className="mt-4 p-4 rounded-lg bg-white border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-gray-700 mb-1">Your Answer: {selectedOption !== null ? question.options[selectedOption as number] : "Not selected"}</p>
              <p className="text-gray-700 mb-1">Correct Answer: {correctOption !== null ? question.options[correctOption as number] : "Not available"}</p>
              <p className="text-gray-700 mb-2">Status: {status}</p>
            </div>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showAnswer ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {showAnswer && question.explanation && (
            <div className="mt-2">
              <p className="text-gray-600">{`Explanation: ${question.explanation}`}</p>
            </div>
          )}
        </div>
      )}

      {!isReviewMode && (
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onSaveForLater}
            disabled={status === "SAVED_FOR_LATER"}
          >
            Save for Later
          </Button>
          <Button
            onClick={onConfirmAnswer}
            disabled={tempAnswer === null}
          >
            Confirm Answer
          </Button>
        </div>
      )}
    </div>
  )
}

export default React.memo(QuestionDisplay)
