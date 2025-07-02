import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/api/route"

interface TestSeries {
  id: number
  name: string
  description: string
  totalQuestions: number
  timeLimit: number
  createdAt: string
}

const TestSelector: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestSeries = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/testSeries`)
        const typedResponse = response as { success: boolean; data: any };
        if (!typedResponse.success) {
          throw new Error("Failed to fetch test series")
        }
        const result = typedResponse.data
        if (result.success && result.data) {
          setTestSeries(result.data.map((series: any) => ({
            id: series.id,
            name: series.name,
            description: series.name, // Using name as description since API doesn't provide description
            totalQuestions: series.questions.length,
            timeLimit: Math.ceil(series.timeTaken / 60), // Convert seconds to minutes
            createdAt: series.createdAt
          })))
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        console.error("Error fetching test series:", err)
        setError("Failed to load test series")
      } finally {
        setLoading(false)
      }
    }

    fetchTestSeries()
  }, [])

  const renderTestSeriesCards = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="space-y-4 flex-1">
                  <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-4">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      )
    }

    if (testSeries.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No test series available</div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {testSeries.map((series) => (
          <div
            key={series.id}
            className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-4 flex-1">
                <h3 className="font-semibold text-2xl text-gray-800">{series.name}</h3>
                <p className="text-gray-600 md:pr-8">{series.description}</p>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{series.totalQuestions} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">{series.timeLimit} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Created: {new Date(series.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <button 
                  onClick={() => navigate(`/test-series/${series.id}`)}
                  className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Portal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from a variety of test options to practice and improve your skills
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">Available Test Series</h2>
          {renderTestSeriesCards()}
        </div>
      </div>
    </div>
  )
}

export default TestSelector