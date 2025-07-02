import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import FullScreenHeader from "../components/testPortal/FullScreenHeader"
import TestStatusPanel from "../components/testPortal/TestStatusPanel"
import { AlertTriangle } from "lucide-react"
import { useSocketTest } from "../hooks/useSocketTest"
// import type { TestSeriesObject } from "@/types/testTypes"
import { usePreventTestExit } from '../hooks/usePreventTestExit';
import { api } from "@/api/route"
// import { useAuth } from "../contexts/AuthContext"
// API function to fetch test series data


            const TEST_DURATION = 30 * 60 // 30 minutes in seconds
            
            const TestSeriesPage: React.FC = () => {
              const navigate = useNavigate()
              const { testSeriesId } = useParams<{ testSeriesId: string }>()
              const {submitSocketTest} = useSocketTest()
              const {
                testData,
                currentQuestionIndex,
                questionStatuses,
                selectedAnswers,
                isReviewMode,
                handleQuestionSelect,
                setIsReviewMode,
                handleOptionSelect,
                handleConfirmAnswer,
                handleSaveForLater,
                setTestData,
                setMarkingScheme,
              } = useTestContext()
              const [loading, setLoading] = useState(true)
              const [testStarted, setTestStarted] = useState(false)
              const [error, setError] = useState<string | null>(null)
              const [remainingTime, setRemainingTime] = useState(TEST_DURATION)
              const [isFullScreen, setIsFullScreen] = useState(false)
              const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
              //const [testSeriesObject, setTestSeriesObject] = useState<TestSeriesObject | null>(null)
              
              // Fetch test series data
              const fetchTestSeriesData = async (testSeriesId: string) => {
                try {
                  setTestStarted(true)
                  const response = await api.get(`/testSeries/${testSeriesId}`)
                  const typedResponse = response as { success: boolean; data: any };
                  if (!typedResponse.success) {
                    throw new Error("Failed to fetch test series data")
                  }
              
                  const data = typedResponse.data
                  const markingScheme = {
                    correct: data.data.correctAttempted,
                    incorrect: data.data.wrongAttempted,
                    unattempted: data.data.notAttempted,
                    partial: data.data.partialAttempted,
                    partialWrong: data.data.partialNotAttempted,
                    partialUnattempted: data.data.partialWrongAttempted,
                  }
                  setMarkingScheme(markingScheme)
                  console.log("Marking scheme:", markingScheme)
                  // Extract questions from the response
                  if (data && data.data && data.data.questions) {
                    return {
                      id: Number.parseInt(testSeriesId),
                      name: data.data.name || `Test Series ${testSeriesId}`,
                      questions: data.data.questions.map((q: any) => ({
                        id: q.id,
                        question: q.question,
                        options: q.options || [],
                        answer: q.answer || "",
                        explaination: q.explanation || q.explaination || "",
                        multipleCorrectType: q.multipleCorrectType || false,
                        pyq: q.pyq || false,
                        year: q.year,
                        creatorName: q.creatorName,
                      })),
                    }
                  }   
                  
                  throw new Error("Invalid test series data format")
                } catch (error) {
                  console.error("Error fetching test series:", error)
                  throw error
                }
              }
              useEffect(() => {
                const loadTestSeriesData = async () => {
                  if (!testSeriesId) {
                    setError("No test series ID provided")
                    setLoading(false)
                    return
                  }
                  
                  try {
                    setIsReviewMode(false)
                    const data = await fetchTestSeriesData(testSeriesId)
                    setTestData({
                      id: data.id,
                      name: data.name,
                      questions: data.questions,
                      type: "testSeries",
                    })
                    setLoading(false)
                  } catch (err) {
                    setError("Failed to load test series data")
                    setLoading(false)
      }
    }

    loadTestSeriesData()
  }, [testSeriesId, setTestData])

  // Timer effect
  useEffect(() => {
    if (isReviewMode || loading) return

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
  }, [isReviewMode, loading])

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
  usePreventTestExit(!isReviewMode && testStarted);
  const handleSubmit = async () => {
    try {
      setTestStarted(false)
      
      setShowConfirmSubmit(false)
      console.log("Submitting socket test...")
      const newtestSeriesObject = ({
        testId: testSeriesId,
        testSeriesName: testData?.name,
      })
      // setTestSeriesObject(newtestSeriesObject);
      console.log("Test series object:", newtestSeriesObject)
      if (!newtestSeriesObject) return
      await submitSocketTest(newtestSeriesObject)
    } catch (error) {
      console.error("Error submitting test:", error)
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading test series data...</div>
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
        <div className="text-xl">No test data available</div>
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

export default TestSeriesPage
