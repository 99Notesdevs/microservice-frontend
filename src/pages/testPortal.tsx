"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import Timer from "../components/testPortal/Timer"
import { QuestionStatus } from "../types/testTypes"
import { sampleQuestions } from "../data/Questions"

const TEST_DURATION = 30 * 60 // 30 minutes in seconds

const TestPortal: React.FC = () => {
  const navigate = useNavigate()

  // State for tracking current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)

  // State for tracking question statuses
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>(
    sampleQuestions.map(() => QuestionStatus.NOT_VISITED),
  )

  // State for tracking selected answers
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(sampleQuestions.length).fill(null))

  // State for tracking test start time
  const [startTime] = useState<number>(Date.now())

  // Handle question selection from grid
  const handleQuestionSelect = (index: number) => {
    // Update current question
    setCurrentQuestionIndex(index)

    // Update status if not visited
    if (questionStatuses[index] === QuestionStatus.NOT_VISITED) {
      const newStatuses = [...questionStatuses]
      newStatuses[index] = QuestionStatus.VISITED
      setQuestionStatuses(newStatuses)
    }
  }

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers]
    newSelectedAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newSelectedAnswers)
  }

  // Handle confirm answer
  const handleConfirmAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] !== null) {
      const newStatuses = [...questionStatuses]
      newStatuses[currentQuestionIndex] = QuestionStatus.ANSWERED
      setQuestionStatuses(newStatuses)
    }
  }

  // Handle save for later
  const handleSaveForLater = () => {
    const newStatuses = [...questionStatuses]
    newStatuses[currentQuestionIndex] = QuestionStatus.SAVED_FOR_LATER
    setQuestionStatuses(newStatuses)
  }

  // Handle navigation
  const handleNext = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)

      // Update status if not visited
      if (questionStatuses[nextIndex] === QuestionStatus.NOT_VISITED) {
        const newStatuses = [...questionStatuses]
        newStatuses[nextIndex] = QuestionStatus.VISITED
        setQuestionStatuses(newStatuses)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Handle test submission
  const handleSubmitTest = useCallback(() => {
    const endTime = Date.now()
    const timeTaken = Math.floor((endTime - startTime) / 1000) // Time taken in seconds

    // Calculate score
    const score = selectedAnswers.reduce<number>((total, answer, index) => {
      if (answer === sampleQuestions[index].correctAnswer) {
        return total + 1
      }
      return total
    }, 0)

    // Prepare test results data
    const testResults = {
      score,
      totalQuestions: sampleQuestions.length,
      timeTaken,
      answers: selectedAnswers,
      questions: sampleQuestions,
      statuses: questionStatuses,
    }

    // Store results in sessionStorage for the results page
    sessionStorage.setItem("testResults", JSON.stringify(testResults))

    // Navigate to results page
    navigate("/submit")
  }, [selectedAnswers, questionStatuses, startTime, navigate])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Test Portal</h1>
          <Timer initialTime={TEST_DURATION} onTimeEnd={handleSubmitTest} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with question grid */}
          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Questions</h2>
            <QuestionGrid
              questions={sampleQuestions}
              statuses={questionStatuses}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
            />

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                  <span>Not visited</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Visited but not confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                  <span>Saved for later</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Answered and confirmed</span>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={handleSubmitTest}
            >
              Submit Test
            </button>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={sampleQuestions[currentQuestionIndex]}
              selectedOption={selectedAnswers[currentQuestionIndex]}
              onOptionSelect={handleOptionSelect}
              onConfirmAnswer={handleConfirmAnswer}
              onSaveForLater={handleSaveForLater}
            />

            <NavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={sampleQuestions.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPortal
