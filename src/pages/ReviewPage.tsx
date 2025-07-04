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
import { api } from "@/api/route"

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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

        const userresponse = await api.get(`/user/testSeries/${testId}`)
        const typedUserResponse = userresponse as { success: boolean; data: any };
        if (!typedUserResponse.success) {
          throw new Error("Failed to fetch review data")
        }
        const userdata = typedUserResponse.data
        console.log("User data: is ", userdata)
        const response = await api.get(`/testSeries/${userdata.testId}`)
        const typedResponse = response as { success: boolean; data: any };
        if (!typedResponse.success) {
          throw new Error("Failed to fetch review data")
        }
        const data = typedResponse.data
        console.log("Review data:", data)
        console.log("User data:", userdata)

        if (!data) {
          throw new Error("Invalid review data format")
        }

        const reviewData = data
        const userResponseData = userdata
        const userResponseSWE = JSON.parse(userResponseData.response)
        const userResponse = JSON.parse(userResponseSWE.response)
        console.log("User response:", userResponse)

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
        const userAnswers = userResponse.map((r: any) => {
          // Find the corresponding question
          const question = questions.find((q: any) => q.id === r.questionId);

          // Use the selectedOptions directly from the response
          const selectedOptions = Array.isArray(r.selectedOptions)
            ? r.selectedOptions
            : [];

          // Initialize flags
          let isCorrect = false;
          let isPartiallyCorrect = false;

          if (question) {
            // Get correct answers from the question data
            const correctAnswers = question.answer
              ? question.answer.split(',').map((a: string) => Number(a.trim()))
              : [];

            if (correctAnswers.length > 0) {
              if (question.multipleCorrectType) {
                // For multiple correct answers
                const allCorrectSelected = selectedOptions.length > 0 &&
                  selectedOptions.every((opt: any) => correctAnswers.includes(opt)) &&
                  selectedOptions.length === correctAnswers.length;

                isCorrect = allCorrectSelected;

                // Partially correct if some but not all correct options are selected
                const someCorrectSelected = selectedOptions.some((opt: any) =>
                  correctAnswers.includes(opt)
                );
                isPartiallyCorrect = !isCorrect && someCorrectSelected;
              } else {
                // For single correct answer
                isCorrect = selectedOptions.length === 1 &&
                  correctAnswers.includes(selectedOptions[0]);
              }
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
        const statuses = questions.map((q: any) => {
          const answer = userAnswers.find((a: any) => a.questionId === q.id)
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
  // const answeredCount = questionStatuses.filter((status) => status === "ANSWERED").length

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
        <button
          onClick={toggleFullScreen}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullScreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0-4h-4m4 0l-5-5" />
            </svg>
          )}
        </button>
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
              onOptionSelect={() => { }} // No-op in review mode
              onConfirmAnswer={() => { }} // No-op in review mode
              onSaveForLater={() => { }} // No-op in review mode
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
