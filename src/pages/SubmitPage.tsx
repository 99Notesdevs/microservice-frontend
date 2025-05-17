"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { QuestionStatus } from "../types/testTypes"

interface TestResults {
  score: number
  totalQuestions: number
  timeTaken: number
  answers: string[]
  questions: any[]
  statuses: QuestionStatus[]
}

const SubmitPage: React.FC = () => {
  const navigate = useNavigate()
  const [results, setResults] = useState<TestResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem("testResults")

    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }

    setLoading(false)
  }, [])

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

  // Calculate analytics
  const calculateAnalytics = () => {
    if (!results) return null

    const answeredCount = results.statuses.filter((status) => status === 'ANSWERED').length

    const savedForLaterCount = results.statuses.filter((status) => status === 'SAVED_FOR_LATER').length

    const notVisitedCount = results.statuses.filter((status) => status === 'NOT_VISITED').length

    const visitedButNotAnsweredCount = results.statuses.filter((status) => status === 'VISITED').length

    return {
      answeredCount,
      savedForLaterCount,
      notVisitedCount,
      visitedButNotAnsweredCount,
      accuracy: (results.score / answeredCount) * 100 || 0,
    }
  }

  const analytics = results ? calculateAnalytics() : null

  const handleRetakeTest = () => {
    // Clear results and go back to test
    sessionStorage.removeItem("testResults")
    navigate("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading results...</div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Test Results Found</h1>
          <p className="mb-6">We couldn't find any test results. You may need to take the test first.</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/")}
          >
            Go to Test
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Test Results</h1>
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">{results.score}</div>
                  <div className="text-gray-500">out of {results.totalQuestions}</div>
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
                  strokeDasharray={`${(results.score / results.totalQuestions) * 283} 283`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Test Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-medium">
                    {results.score} / {results.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Percentage:</span>
                  <span className="font-medium">{Math.round((results.score / results.totalQuestions) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Taken:</span>
                  <span className="font-medium">{formatTime(results.timeTaken)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Question Analytics</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium">
                    {analytics?.answeredCount} / {results.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saved for Later:</span>
                  <span className="font-medium">{analytics?.savedForLaterCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Not Visited:</span>
                  <span className="font-medium">{analytics?.notVisitedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{analytics?.accuracy.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Question Breakdown</h2>
          <div className="space-y-4 mb-8">
            {results.questions.map((question, index) => {
              const userAnswer = results.answers[index]
              const isCorrect = userAnswer === question.answer
              const status = results.statuses[index]

              return (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    status === 'NOT_VISITED'
                      ? "border-gray-300 bg-gray-50"
                      : status === 'ANSWERED'
                        ? (isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50")
                        : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-800 font-medium text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{question.question}</p>

                      {status !== 'NOT_VISITED' && (
                        <div className="ml-4">
                          <div className="text-sm text-gray-600 mb-1">Your answer:</div>
                          <div className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                            {userAnswer ? question.options[Number(userAnswer)] : "No answer selected"}
                          </div>

                          {userAnswer !== question.answer && userAnswer && (
                            <div className="mt-2">
                              <div className="text-sm text-gray-600 mb-1">Correct answer:</div>
                              <div className="font-medium text-green-600">
                                {question.options[Number(question.answer)]}
                              </div>
                              {question.explaination && (
                                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                                  <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                                  <p className="text-sm text-blue-700">{question.explaination}</p>
                                  {question.creatorName && (
                                    <p className="text-xs text-gray-600 mt-2 italic">
                                      Added by: {question.creatorName}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {status === 'NOT_VISITED' && <div className="text-gray-500 italic">Not visited</div>}
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      {status === 'ANSWERED' &&
                        (isCorrect ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Incorrect
                          </span>
                        ))}
                      {status === 'SAVED_FOR_LATER' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Saved for Later
                        </span>
                      )}
                      {status === 'VISITED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Visited Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={handleRetakeTest}
            >
              Retake Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitPage
