import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import { useSocketTest } from "../hooks/useSocketTest"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import FullScreenHeader from "../components/testPortal/FullScreenHeader"
import TestStatusPanel from "../components/testPortal/TestStatusPanel"
import { AlertTriangle } from "lucide-react"
import { useSocket } from "../contexts/SocketContext"
import { usePreventTestExit } from '../hooks/usePreventTestExit';

const SocketTestPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    testData,
    currentQuestionIndex,
    questionStatuses,
    selectedAnswers,
    isReviewMode,
    setIsReviewMode,
    handleQuestionSelect,
    handleOptionSelect,
    handleConfirmAnswer,
    handleSaveForLater,
  } = useTestContext()

  const { socket } = useSocket()
  const { loading, error: socketError, testDuration, testStarted, startSocketTest, submitSocketTest } = useSocketTest()
  const [remainingTime, setRemainingTime] = useState(testDuration)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  // const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (socket && !testStarted && !isReviewMode && !isInitialized) {
      setIsInitialized(true);
      startSocketTest();
    }
  }, [socket, testStarted, isReviewMode, isInitialized, startSocketTest]);

  usePreventTestExit(!isReviewMode && testStarted);

  // Update remaining time when test duration changes
  useEffect(() => {
    setRemainingTime(testDuration)
  }, [testDuration])

  // Timer effect
  useEffect(() => {
    if (isReviewMode || loading || !testStarted) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          submitSocketTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isReviewMode, loading, testStarted, submitSocketTest])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading questions...</div>
        <h1 className="text-xl">Please Refresh if it takes too long</h1>
      </div>
    )
  }

  if (socketError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{socketError}</p>
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
        <div className="text-xl">No test data available</div>
      </div>
    )
  }

  const currentQuestion = testData.questions[currentQuestionIndex]
  const currentAnswer = selectedAnswers.find((a) => a.questionId === currentQuestion.id)
  const answeredCount = questionStatuses.filter((status) => status === "ANSWERED").length

  const handleSubmit = async () => {
    try {
      setShowConfirmSubmit(false)
      console.log("Submitting socket test...")
      await submitSocketTest(undefined)

      // Force navigation after a short delay
      setTimeout(() => {
        console.log("Forcing navigation to submit page")
        setIsReviewMode(true)
        // navigate("/submit", { replace: true })
      }, 1000)
    } catch (error) {
      console.error("Error submitting test:", error)
      // setError("Failed to submit test. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <FullScreenHeader
        testName="Socket Test"
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

export default SocketTestPage
