import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {env} from "../config/env"

const TestSelector: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [testSeries, setTestSeries] = useState<any[]>([])

  useEffect(() => {
    const fetchTestSeries = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${env.API}/testSeries`)
        if (!response.ok) throw new Error("Failed to fetch test series")
        const result = await response.json()
        if (result.success && result.data) {
          setTestSeries(result.data.map((series: any) => ({
            id: series.id,
            name: series.name,
            description: series.name, // Using name as description since API doesn't provide description
            totalQuestions: series.questions.length,
            timeLimit: Math.ceil(series.timeTaken / 60), // Convert seconds to minutes
            correctAttempted: series.correctAttempted,
            wrongAttempted: series.wrongAttempted,
            partialAttempted: series.partialAttempted,
            createdAt: series.createdAt
          })))
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        console.error("Error fetching test series:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestSeries()
  }, [])

  const renderTestSeriesCards = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-4 mb-4 bg-gray-100"
            >
              <div className="h-4 bg-gray-300 rounded mb-2" style={{ width: "80%" }}></div>
              <div className="h-3 bg-gray-300 rounded" style={{ width: "60%" }}></div>
            </div>
          ))}
        </div>
      )
    }

    if (testSeries.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No test series available
        </div>
      )
    }

    return testSeries.map((series) => (
      <div
        key={series.id}
        className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors mb-4"
        onClick={() => navigate(`/test-series/${series.id}`)}
      >
        <h3 className="font-medium text-lg">{series.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{series.description}</p>
        <div className="mt-2 text-sm flex items-center">
          <span className="mr-2">{series.totalQuestions} Questions</span>
          <span className="text-green-600">•</span>
          <span className="ml-2">{series.timeLimit} Minutes</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Created: {new Date(series.createdAt).toLocaleDateString()}
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Test Portal</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => navigate("/socket-test")}
              >
                <h3 className="font-medium text-lg">Socket Test</h3>
                <p className="text-gray-600 text-sm mt-1">Take a test using socket connection</p>
              </div>

              <div
                className="border rounded-lg p-4 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
                onClick={() => navigate("/review/1")}
              >
                <h3 className="font-medium text-lg">Review Test</h3>
                <p className="text-gray-600 text-sm mt-1">Review a completed test</p>
              </div>

              <div
                className="border rounded-lg p-4 hover:bg-yellow-50 hover:border-yellow-300 cursor-pointer transition-colors"
                onClick={() => navigate("/test")}
              >
                <h3 className="font-medium text-lg">Standard Test</h3>
                <p className="text-gray-600 text-sm mt-1">Take a standard test</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Test Series</h2>
            {renderTestSeriesCards()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestSelector
