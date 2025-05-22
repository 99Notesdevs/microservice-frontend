"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import TestStatusPanel from "../components/testPortal/TestStatusPanel"
import FullScreenHeader from "../components/testPortal/FullScreenHeader"
import type { SubmitFunction } from "../types/testTypes"
import { AlertTriangle } from "lucide-react"

// Example submit functions (to be replaced with actual implementations)
const submitTestSeries: SubmitFunction = async (result) => {
  console.log("Submitting test series result:", result)
  // Implementation for submitting test series results
  // e.g., API call to save results
}

const submitTest: SubmitFunction = async (result) => {
  console.log("Submitting test result:", result)
  // Implementation for submitting individual test results
}

const TEST_DURATION = 30 * 60 // 30 minutes in seconds

const TestPortal: React.FC = () => {
  const navigate = useNavigate()
  const {
    testData,
    currentQuestionIndex,
    questionStatuses,
    selectedAnswers,
    isReviewMode,
    handleQuestionSelect,
    handleOptionSelect,
    handleConfirmAnswer,
    handleSaveForLater,
    handleSubmitTest,
  } = useTestContext()

  const [remainingTime, setRemainingTime] = useState(TEST_DURATION)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  useEffect(() => {
    // Redirect to home if no test data is available
    if (!testData) {
      navigate("/")
    }
  }, [testData, navigate])

  // Timer effect
  useEffect(() => {
    if (isReviewMode) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isReviewMode])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Update fullscreen state when fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
    }
  }, [])

  const handleSubmit = useCallback(() => {
    // Choose the appropriate submit function based on test type
    let submitFn: SubmitFunction | undefined

    if (testData?.type === "testSeries") {
      submitFn = submitTestSeries
    } else if (testData?.type === "test") {
      submitFn = submitTest
    }

    handleSubmitTest(submitFn)
    // navigate("/submit")
  }, [testData, handleSubmitTest, navigate])

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading test data...</div>
      </div>
    )
  }

  const currentQuestion = testData.questions[currentQuestionIndex]
  const currentAnswer = selectedAnswers.find((a) => a.questionId === currentQuestion.id)
  const answeredCount = questionStatuses.filter((status) => status === "ANSWERED").length

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <FullScreenHeader
        testName={testData.name}
        remainingTime={remainingTime}
        questionCount={testData.questions.length}
        answeredCount={answeredCount}
        toggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
      />

      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Questions</h2>
              <QuestionGrid
                questions={testData.questions}
                statuses={questionStatuses}
                currentIndex={currentQuestionIndex}
                onQuestionSelect={handleQuestionSelect}
                isReviewMode={isReviewMode}
                answers={selectedAnswers}
              />
            </div>

            <TestStatusPanel questionStatuses={questionStatuses} isReviewMode={isReviewMode} />

            {!isReviewMode && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <button
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => setShowConfirmSubmit(true)}
                >
                  Submit Test
                </button>
              </div>
            )}

            {isReviewMode && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <button
                  className="w-full py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  onClick={() => navigate("/")}
                >
                  Exit Review
                </button>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={currentQuestion}
              selectedOptions={currentAnswer?.selectedOptions || []}
              onOptionSelect={handleOptionSelect}
              onConfirmAnswer={handleConfirmAnswer}
              onSaveForLater={handleSaveForLater}
              isReviewMode={isReviewMode}
            />

            <NavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={testData.questions.length}
              onNext={() => {
                if (currentQuestionIndex < testData.questions.length - 1) {
                  handleQuestionSelect(currentQuestionIndex + 1)
                }
              }}
              onPrevious={() => {
                if (currentQuestionIndex > 0) {
                  handleQuestionSelect(currentQuestionIndex - 1)
                }
              }}
              onSaveAndNext={
                !isReviewMode
                  ? () => {
                      handleConfirmAnswer()
                      if (currentQuestionIndex < testData.questions.length - 1) {
                        handleQuestionSelect(currentQuestionIndex + 1)
                      }
                    }
                  : undefined
              }
              onMarkForReview={
                !isReviewMode
                  ? () => {
                      handleSaveForLater()
                      if (currentQuestionIndex < testData.questions.length - 1) {
                        handleQuestionSelect(currentQuestionIndex + 1)
                      }
                    }
                  : undefined
              }
              isReviewMode={isReviewMode}
            />
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center text-amber-600 mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold">Confirm Submission</h3>
            </div>

            <p className="mb-6">
              Are you sure you want to submit your test? You have answered {answeredCount} out of{" "}
              {testData.questions.length} questions.
            </p>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleSubmit}
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestPortal
