import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import Timer from "../components/testPortal/Timer"
import type { QuestionStatus, Question } from "../types/testTypes"
import { env } from '../config/env'
import Cookies from 'js-cookie'

const TEST_DURATION = 30 * 60 // 30 minutes

const TestPortal: React.FC = () => {
  const navigate = useNavigate()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [startTime] = useState<number>(Date.now())

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
  
      const urlParams = new URLSearchParams(location.search)
      const categoryIds = urlParams.get('categoryIds')
  
      if (!categoryIds) throw new Error('No categories selected')
  
      const response = await fetch(`${env.API}/questions/practice?limit=10&categoryIds=${categoryIds}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      })
  
      if (!response.ok) throw new Error('Failed to fetch questions')
  
      const apiResponse = await response.json()
      const data = apiResponse.data // Extract the data array
      setQuestions(data)
      setQuestionStatuses(data.map(() => 'NOT_VISITED' as QuestionStatus))
      setSelectedAnswers(Array(data.length).fill(null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [location.search])

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
    if (questionStatuses[index] === 'NOT_VISITED') {
      const newStatuses = [...questionStatuses]
      newStatuses[index] = 'VISITED'
      setQuestionStatuses(newStatuses)
    }
  }

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleConfirmAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] !== null) {
      const newStatuses = [...questionStatuses]
      newStatuses[currentQuestionIndex] = 'ANSWERED'
      setQuestionStatuses(newStatuses)
    }
  }

  const handleSaveForLater = () => {
    const newStatuses = [...questionStatuses]
    newStatuses[currentQuestionIndex] = 'SAVED_FOR_LATER'
    setQuestionStatuses(newStatuses)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      if (questionStatuses[nextIndex] === 'NOT_VISITED') {
        const newStatuses = [...questionStatuses]
        newStatuses[nextIndex] = 'VISITED'
        setQuestionStatuses(newStatuses)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = useCallback(() => {
    const endTime = Date.now()
    const timeTaken = Math.floor((endTime - startTime) / 1000)
  
    // Compare selected answer (number) with API answer (string)
    const score = selectedAnswers.reduce<number>((total, answer, index) => {
      // Convert selected answer to string to match API format
      return String(answer) === questions[index].answer ? total + 1 : total
    }, 0)
  
    const testResults = {
      score,
      totalQuestions: questions.length,
      timeTaken,
      answers: selectedAnswers,
      questions,
      statuses: questionStatuses,
    }
  
    sessionStorage.setItem("testResults", JSON.stringify(testResults))
    navigate("/submit")
  }, [selectedAnswers, questionStatuses, questions, startTime, navigate])
  // 👉 Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-medium">
        Loading questions...
      </div>
    )
  }

  // 👉 Show error with retry option
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchQuestions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Test Portal</h1>
          <Timer initialTime={TEST_DURATION} onTimeEnd={handleSubmitTest} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Questions</h2>
            <QuestionGrid
              questions={questions}
              statuses={questionStatuses}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
            />

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
                  <span>Not visited</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                  <span>Visited but not confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2" />
                  <span>Saved for later</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                  <span>Answered and confirmed</span>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={handleSubmitTest}
            >
              Submit Test
            </button>
          </div>
          
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={questions[currentQuestionIndex]}
              selectedOption={selectedAnswers[currentQuestionIndex]}
              onOptionSelect={handleOptionSelect}
              onConfirmAnswer={handleConfirmAnswer}
              onSaveForLater={handleSaveForLater}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
            />

            <NavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPortal
