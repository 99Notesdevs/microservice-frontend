"use client"

import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import { CheckCircle, XCircle, Clock, FileText, Home } from "lucide-react"

const SubmitPage: React.FC = () => {
  const navigate = useNavigate()
  const { testData, testResult } = useTestContext()

  useEffect(() => {
    // Log the test result for debugging
    console.log("Test result in SubmitPage:", testResult)
    console.log("Test data in SubmitPage:", testData)
  }, [testResult, testData])

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

  // Calculate metrics from test results
  const totalQuestions = testData.questions?.length || testResult.totalQuestions || 0
  
  // Default to 1 mark per question if not specified
  const marksPerQuestion = 1
  // Calculate total marks based on number of questions (1 mark per question by default)
  const totalMarks = totalQuestions * marksPerQuestion
  
  // Use testResult.negativeMarking which is a boolean, convert to number (1 for true, 0 for false)
  const negativeMarks = testResult.negativeMarking ? 0.25 : 0 // Default 0.25 negative marking if enabled

  // Count correct and incorrect answers
  let correctAttempted = 0
  let marksObtained = 0
  
  const answers = testResult.answers || {}
  const correctAnswers = testResult.correctAnswers || {}
  
  Object.keys(answers).forEach((questionId) => {
    const userAnswers = answers[questionId] || []
    const correctAns = correctAnswers[questionId] || []
    
    // All questions are worth 1 mark by default
    const questionMarks = 1

    if (userAnswers.length === 0) return // Skip unanswered questions

    // Check if answers are correct (order doesn't matter)
    const isCorrect = userAnswers.length === correctAns.length && 
                     userAnswers.every(answer => correctAns.includes(answer))

    if (isCorrect) {
      correctAttempted++
      marksObtained += questionMarks
    } else if (negativeMarks > 0) {
      // Apply negative marking for wrong answers if enabled
      marksObtained = Math.max(0, marksObtained - (questionMarks * negativeMarks))
    }
  })


  // Ensure marks don't go below zero
  marksObtained = Math.max(0, marksObtained)

  // Count attempted questions
  const attemptedQuestions = Object.values(testResult.answers || {}).filter(
    (answers) => answers && answers.length > 0,
  ).length

  // Calculate wrong answers
  const wrongAnswers = attemptedQuestions - correctAttempted

  // Calculate score percentage
  const score = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0


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
                    {formatTime(testResult.timeTaken || 0)} Duration
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Correct Answers</h3>
                      <p className="text-2xl font-bold text-gray-800">{correctAttempted}</p>
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
                      <p className="text-2xl font-bold text-gray-800">{wrongAnswers}</p>
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
                      <p className="text-2xl font-bold text-gray-800">{formatTime(testResult.timeTaken || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-blue-600">
                            {marksObtained}<span className="text-2xl text-gray-500">/{totalMarks}</span>
                          </div>
                          <div className="text-gray-500 mt-2">Marks Obtained</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3 md:pl-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Question Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Questions:</span>
                              <span className="font-medium">{totalQuestions} (Max Marks: {totalMarks})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Marks Obtained:</span>
                              <span className="font-medium">{marksObtained} / {totalMarks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Attempted:</span>
                              <span className="font-medium">
                                {attemptedQuestions} (
                                {totalQuestions > 0 ? Math.round((attemptedQuestions / totalQuestions) * 100) : 0}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Accuracy:</span>
                              <span className="font-medium">
                                {attemptedQuestions > 0 ? Math.round((correctAttempted / attemptedQuestions) * 100) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Score:</span>
                              <span className="font-medium">{score}%</span>
                            </div>
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

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
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
