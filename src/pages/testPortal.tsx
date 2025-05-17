"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import Timer from "../components/testPortal/Timer"
import TestSummary from "../components/testPortal/TestSummary"
import { useTestState } from "../hooks/useTestState"
import { useSocketConnection } from "../hooks/useSocketConnection"
import { useTestNavigation } from "../hooks/useTestNavigation"
import { Button } from "../components/ui/button"
import { Loader2 } from "lucide-react"

const TestPortal: React.FC = () => {
  const navigate = useNavigate()
  const userId = localStorage.getItem("userId")

  const {
    questions,
    questionStatuses,
    selectedAnswers,
    currentQuestionIndex,
    negativeMarking,
    testDuration,
    loading,
    error,
    isReviewMode,
    testResults,
    setError,
    setQuestions,
    setQuestionStatuses,
    setSelectedAnswers,
    setCurrentQuestionIndex,
    setNegativeMarking,
    setTestDuration,
    setLoading,
    setIsReviewMode,
    setTestResults,
  } = useTestState()

  const {
    testStarted,
    setTestStarted,
    handleQuestionSelect,
    handleOptionSelect,
    handleConfirmAnswer,
    handleSaveForLater,
    handleNext,
    handlePrevious,
  } = useTestNavigation({
    questions,
    questionStatuses,
    selectedAnswers,
    currentQuestionIndex,
    isReviewMode,
    setCurrentQuestionIndex,
    setQuestionStatuses,
    setSelectedAnswers,
  })

  const startTime = useState<number>(() => Date.now())[0]

  const { socket, fetchQuestions, handleSubmitTest } = useSocketConnection({
    userId,
    questions,
    selectedAnswers,
    questionStatuses,
    startTime,
    negativeMarking,
    setQuestions,
    setQuestionStatuses,
    setSelectedAnswers,
    setLoading,
    setError,
    setTestDuration,
    setNegativeMarking,
    setTestStarted,
    setIsReviewMode,
    setTestResults,
  })

  useEffect(() => {
    if (!socket) {
      fetchQuestions()
    }
  }, [socket, fetchQuestions])

  useEffect(() => {
    if (!userId) {
      setError("User not authenticated")
      return
    }
  }, [userId, setError])

  useEffect(() => {
    if (!testStarted || isReviewMode) return

    const handlePopState = (_event: PopStateEvent) => {
      const confirmLeave = window.confirm("Are you sure you want to leave the test? Your progress may be lost.")

      if (!confirmLeave) {
        navigate(window.location.pathname, { replace: true })
      } else {
        setTestStarted(false)
        return
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (testStarted && !isReviewMode) {
        event.preventDefault()
        event.returnValue = "Are you sure you want to leave? Your test progress will be lost."
        return event.returnValue
      }
    }

    window.addEventListener("popstate", handlePopState)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [navigate, testStarted, isReviewMode, setTestStarted])

  const handleRetakeTest = () => {
    setIsReviewMode(false)
    setTestStarted(true)
    setCurrentQuestionIndex(0)
    setQuestionStatuses(questions.map(() => "NOT_VISITED" as const))
    setSelectedAnswers(Array(questions.length).fill(null))
    setTestResults(null)
  }

  const handleFinishReview = () => {
    navigate("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchQuestions} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{isReviewMode ? "Test Review" : "Test"}</h1>
          {!isReviewMode && <Timer initialTime={testDuration} onTimeEnd={handleSubmitTest} />}
        </div>

        {isReviewMode && testResults && (
          <TestSummary
            score={testResults.score}
            totalQuestions={testResults.totalQuestions}
            timeTaken={testResults.timeTaken}
            onRetake={handleRetakeTest}
            onFinish={handleFinishReview}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white shadow-sm p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Questions</h2>
            <QuestionGrid
              questions={questions}
              statuses={questionStatuses}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
              isReviewMode={isReviewMode}
              correctAnswers={testResults?.correctAnswers}
              selectedAnswers={selectedAnswers}
            />

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Legend</h3>
              <div className="space-y-2 text-sm">
                {!isReviewMode ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
                      <span>Not visited</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                      <span>Visited but not confirmed</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-2" />
                      <span>Saved for later</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                      <span>Answered and confirmed</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                      <span>Correct answer</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                      <span>Incorrect answer</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
                      <span>Not answered</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!isReviewMode ? (
              <Button className="w-full mt-6" onClick={handleSubmitTest}>
                Submit Test
              </Button>
            ) : (
              <div className="space-y-2 mt-6">
                <Button className="w-full" onClick={handleRetakeTest}>
                  Retake Test
                </Button>
                <Button className="w-full" variant="outline" onClick={handleFinishReview}>
                  Finish Review
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-white shadow-sm rounded-lg">
            <QuestionDisplay
              question={questions[currentQuestionIndex]}
              selectedOption={selectedAnswers[currentQuestionIndex]}
              onOptionSelect={handleOptionSelect}
              onConfirmAnswer={handleConfirmAnswer}
              onSaveForLater={handleSaveForLater}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              isReviewMode={isReviewMode}
              correctOption={testResults?.correctAnswers?.[questions[currentQuestionIndex].id]}
              status={questionStatuses[currentQuestionIndex]}
            />

            <NavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
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
