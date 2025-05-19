"use client"

import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import { CheckCircle, XCircle, AlertCircle, Clock, FileText, Home, RotateCcw, Eye } from "lucide-react"

const SubmitPage: React.FC = () => {
  const navigate = useNavigate()
  const { testData, testResult, setIsReviewMode } = useTestContext()
  console.log("testResult on submit page", testResult)
  useEffect(() => {
    // Redirect to home if no test result is available
    if (!testResult) {
      navigate("/")
    }
  }, [testResult, navigate])

  if (!testResult || !testData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">No test results available</div>
      </div>
    )
  }

  // Format time (seconds) to mm:ss or hh:mm:ss
  const formatTime = (seconds: number): string => {
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    }
  }

  // Calculate total questions
  const totalQuestions = testResult.questionsSingle + (testResult.questionsMultiple || 0)

  // Calculate score percentage
  const scorePercentage = Math.round(
    ((testResult.correctAttempted + (testResult.partialAttempted || 0) * 0.5) / totalQuestions) * 100,
  )

  const handleReviewTest = () => {
    setIsReviewMode(true)
    navigate("/test")
  }

  const handleRetakeTest = () => {
    // Reset review mode and navigate to test
    setIsReviewMode(false)
    navigate("/test")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Test Results</h1>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 bg-blue-50 border-b border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{testData.name}</h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FileText className="w-4 h-4 mr-1" />
                    {totalQuestions} Questions
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(testResult.timeTaken)} Duration
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                    <span className="text-gray-500 mr-2">Score:</span>
                    <span className="text-2xl font-bold text-blue-600">{scorePercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Correct Answers</h3>
                      <p className="text-2xl font-bold text-gray-800">{testResult.correctAttempted}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center">
                    <div className="bg-red-100 rounded-full p-2 mr-4">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Wrong Answers</h3>
                      <p className="text-2xl font-bold text-gray-800">{testResult.wrongAttempted}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 rounded-full p-2 mr-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {testResult.partialAttempted ? "Partially Correct" : "Not Attempted"}
                      </h3>
                      <p className="text-2xl font-bold text-gray-800">
                        {testResult.partialAttempted || testResult.notAttempted}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Time Taken</h3>
                      <p className="text-2xl font-bold text-gray-800">{formatTime(testResult.timeTaken)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                      <div className="relative w-48 h-48">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-blue-600">{scorePercentage}%</div>
                            <div className="text-gray-500 mt-1">Score</div>
                          </div>
                        </div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="10" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="10"
                            strokeDasharray={`${(scorePercentage / 100) * 283} 283`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="md:w-2/3 md:pl-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Question Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Questions:</span>
                              <span className="font-medium">{totalQuestions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Attempted:</span>
                              <span className="font-medium">
                                {totalQuestions - testResult.notAttempted} (
                                {Math.round(((totalQuestions - testResult.notAttempted) / totalQuestions) * 100)}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Accuracy:</span>
                              <span className="font-medium">
                                {Math.round(
                                  (testResult.correctAttempted /
                                    (testResult.correctAttempted +
                                      testResult.wrongAttempted +
                                      (testResult.partialAttempted || 0))) *
                                    100,
                                ) || 0}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Question Types</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Single Choice:</span>
                              <span className="font-medium">{testResult.questionsSingle}</span>
                            </div>
                            {testResult.questionsMultiple !== undefined && testResult.questionsMultiple > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Multiple Choice:</span>
                                <span className="font-medium">{testResult.questionsMultiple}</span>
                              </div>
                            )}
                            {testResult.negativeMarking && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Negative Marking:</span>
                                <span className="font-medium text-red-600">Yes</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
                  onClick={handleReviewTest}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Review Test
                </button>
                <button
                  className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center"
                  onClick={handleRetakeTest}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retake Test
                </button>
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center"
                  onClick={() => navigate("/")}
                >
                  <Home className="w-5 h-5 mr-2" />
                  New Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SubmitPage
