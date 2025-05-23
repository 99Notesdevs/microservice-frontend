"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import TestStatusPanel from "../components/testPortal/TestStatusPanel"
import type { QuestionStatus } from "../types/testTypes"
import Cookies from "js-cookie"
import { env } from "../config/env"
import { useAuth } from "../contexts/AuthContext"

const ReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { testId } = useParams<{ testId: string }>()
  const {
    testData,
    currentQuestionIndex,
    questionStatuses,
    selectedAnswers,
    handleQuestionSelect,
    setTestData,
    setIsReviewMode,
    setQuestionStatuses,
    setSelectedAnswers,
  } = useTestContext()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Fetch review data
  useEffect(() => {
    const loadReviewData = async () => {
      if (!testId) {
        setError("No test ID provided")
        setLoading(false)
        return
      }

      try {
        // Fetch test data from API
        const response = await fetch(`${env.API}/testSeries/${testId}/review`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch review data")
        }

        const data = await response.json()
        console.log("Review data:", data)

        if (!data || !data.data) {
          throw new Error("Invalid review data format")
        }

        const reviewData = data.data

        // Extract questions from the response
        const questions = reviewData.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options || [],
          answer: q.answer || "",
          explaination: q.explanation || q.explaination || "",
          multipleCorrectType: q.multipleCorrectType || false,
          pyq: q.pyq || false,
          year: q.year,
          creatorName: q.creatorName,
          isCorrect: q.isCorrect,
        }))

        // Extract user answers from the response
        const userAnswers = reviewData.response.map((r: any) => {
          // Find the corresponding question
          const question = questions.find((q) => q.id === r.questionId)

          // Parse selected options from string to array of numbers
          let selectedOptions: number[] = []
          if (r.selectedOption && r.selectedOption !== "-1") {
            selectedOptions = r.selectedOption.split(",").map((opt: string) => Number.parseInt(opt.trim(), 10))
          }

          // Determine if the answer is correct
          let isCorrect = false
          let isPartiallyCorrect = false

          if (question && question.answer && selectedOptions.length > 0) {
            const correctOptions = question.answer.split(",").map((opt) => Number.parseInt(opt.trim(), 10))

            if (question.multipleCorrectType) {
              // For multiple choice: check if all selected options are correct and all correct options are selected
              isCorrect =
                selectedOptions.length === correctOptions.length &&
                selectedOptions.every((opt) => correctOptions.includes(opt))

              // Partially correct if some but not all correct options are selected
              isPartiallyCorrect = !isCorrect && selectedOptions.some((opt) => correctOptions.includes(opt))
            } else {
              // For single choice: check if the selected option is correct
              isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0])
            }
          }

          return {
            questionId: r.questionId,
            selectedOptions,
            isCorrect,
            isPartiallyCorrect,
          }
        })

        // Create question statuses based on user answers
        const statuses = questions.map((q) => {
          const answer = userAnswers.find((a) => a.questionId === q.id)
          if (!answer || answer.selectedOptions.length === 0) {
            return "NOT_VISITED" as QuestionStatus
          }
          return "ANSWERED" as QuestionStatus
        })

        // Set review mode
        setIsReviewMode(true)

        // Set test data
        setTestData({
          id: Number.parseInt(testId),
          name: reviewData.name || `Test Review ${testId}`,
          questions,
          type: "review",
        })

        // Set selected answers
        setSelectedAnswers(userAnswers)

        // Set question statuses
        setQuestionStatuses(statuses)

        setLoading(false)
      } catch (err) {
        console.error("Error loading review data:", err)
        setError("Failed to load review data")
        setLoading(false)
      }
    }

    loadReviewData()
  }, [testId, setTestData, setIsReviewMode, setQuestionStatuses, setSelectedAnswers])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading review data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => navigate("/")}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">No review data available</div>
      </div>
    )
  }

  const currentQuestion = testData.questions[currentQuestionIndex]
  const currentAnswer = selectedAnswers.find((a) => a.questionId === currentQuestion.id)
  const answeredCount = questionStatuses.filter((status) => status === "ANSWERED").length

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-800">{testData.name}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>Review Mode</span>
            </div>
          </div>
        </div>
      </header>

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
                isReviewMode={true}
                answers={selectedAnswers}
              />
            </div>

            <TestStatusPanel questionStatuses={questionStatuses} isReviewMode={true} />

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <button
                className="w-full py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                onClick={() => navigate("/")}
              >
                Exit Review
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={currentQuestion}
              selectedOptions={currentAnswer?.selectedOptions || []}
              onOptionSelect={() => {}} // No-op in review mode
              onConfirmAnswer={() => {}} // No-op in review mode
              onSaveForLater={() => {}} // No-op in review mode
              isReviewMode={true}
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
              isReviewMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
