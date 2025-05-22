"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import type { Question, UserAnswer, QuestionStatus } from "../types/testTypes"

// Example API function to fetch test review data
const fetchTestReviewData = async (testId: string) => {
  // In a real app, this would be an API call
  // For now, we'll simulate it with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sample review data
      resolve({
        id: Number.parseInt(testId),
        name: `Test Review ${testId}`,
        questions: [
          {
            id: 1,
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            answer: "2", // Paris (index 2)
            explaination: "Paris is the capital and most populous city of France.",
            multipleCorrectType: false,
          },
          {
            id: 2,
            question: "Which of the following are primary colors?",
            options: ["Red", "Green", "Blue", "Yellow"],
            answer: "0,2,3", // Red, Blue, Yellow
            explaination: "Red, Blue, and Yellow are primary colors in traditional color theory.",
            multipleCorrectType: true,
          },
          // Add more questions as needed
        ],
        userAnswers: [
          {
            questionId: 1,
            selectedOptions: [2], // Correct answer
            isCorrect: true,
          },
          {
            questionId: 2,
            selectedOptions: [0, 2], // Partially correct
            isCorrect: false,
            isPartiallyCorrect: true,
          },
        ],
        questionStatuses: ["ANSWERED", "ANSWERED"],
      })
    }, 500)
  }) as Promise<{
    id: number
    name: string
    questions: Question[]
    userAnswers: UserAnswer[]
    questionStatuses: string[]
  }>
}

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
  } = useTestContext()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch review data
  useEffect(() => {
    const loadReviewData = async () => {
      if (!testId) {
        setError("No test ID provided")
        setLoading(false)
        return
      }

      try {
        const data = await fetchTestReviewData(testId)

        // Set review mode
        setIsReviewMode(true)

        // Set test data
        setTestData({
          id: data.id,
          name: data.name,
          questions: data.questions,
          type: "review",
        })

        // Set question statuses
        setQuestionStatuses(data.questionStatuses.map((status) => status as QuestionStatus))

        setLoading(false)
      } catch (err) {
        setError("Failed to load review data")
        setLoading(false)
      }
    }

    loadReviewData()
  }, [testId, setTestData, setIsReviewMode, setQuestionStatuses])

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{testData.name}</h1>
            <p className="text-gray-600">Test Review</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with question grid */}
          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Questions</h2>
            <QuestionGrid
              questions={testData.questions}
              statuses={questionStatuses}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
              isReviewMode={true}
              answers={selectedAnswers}
            />

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
                  <span>Correct answer</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
                  <span>Wrong answer</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-300 rounded mr-2"></div>
                  <span>Partially correct</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                  <span>Not attempted</span>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
              onClick={() => navigate("/")}
            >
              Exit Review
            </button>
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
