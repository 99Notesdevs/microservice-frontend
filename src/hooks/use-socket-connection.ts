import { useEffect, useCallback, useRef } from "react"
import Cookies from "js-cookie"
import type { QuestionStatus } from "../types/testTypes"
import { useSocket } from "../contexts/SocketContext"
import { env } from "../config/env"
import { useTestContext } from "../contexts/TestContext"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

interface UseSocketConnectionProps {
  userId: string | null | undefined
  questions: any[]
  selectedAnswers: (string | null)[]
  questionStatuses: QuestionStatus[]
  startTime: number
  negativeMarking: boolean
  setQuestions: (questions: any[]) => void
  setQuestionStatuses: (statuses: QuestionStatus[]) => void
  setSelectedAnswers: (answers: (string | null)[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setTestDuration: (duration: number) => void
  setNegativeMarking: (value: boolean) => void
  setTestStarted: (started: boolean) => void
  setIsReviewMode: (isReview: boolean) => void
  setTestResults: (results: any) => void
}

export const useSocketConnection = ({
  questions,
  selectedAnswers,
  questionStatuses,
  startTime,
  negativeMarking,
  setQuestions,
  setQuestionStatuses,
  setSelectedAnswers,
  setLoading,
  setError,
  setTestStarted,
  setIsReviewMode,
}: UseSocketConnectionProps) => {
  const { socket } = useSocket() // Use the shared socket from context
  const apiUrl = env.API
  const { markingScheme, testData, setTestResult } = useTestContext()
  const { user } = useAuth()
  const userId = user?.id
  const navigate = useNavigate()
  const questionsRef = useRef(questions)  
  const selectedAnswersRef = useRef(selectedAnswers)
  useEffect(() => {
    questionsRef.current = questions
  }, [questions])
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers
  }, [selectedAnswers])
  useEffect(() => {
    if (!socket) return

    // Set up event listeners only once
    console.log("Setting up socket event listeners (once)")

    // Function to handle fetch-questions event
    const handleFetchQuestions = (data: any) => {
      console.log("Received questions:", data)
      if (data.status === "success") {
        // Set proper type for each question based on its format
        const typedQuestions = data.questions.map((q: any) => {
          // Determine question type based on format
          const type = q.multipleCorrectType ? "MULTIPLE" : q.options && q.options.length > 0 ? "SINGLE" : "INTEGER"

          return {
            ...q,
            type,
            // Ensure answer is properly typed
            answer: q.answer ? (typeof q.answer === "number" ? q.answer.toString() : q.answer) : undefined,
          }
        })

        setQuestions(typedQuestions)
        setQuestionStatuses(typedQuestions.map(() => "NOT_VISITED" as QuestionStatus))
        setSelectedAnswers(Array(typedQuestions.length).fill(null))
        setLoading(false)
      } else {
        setError(data.message || "Failed to fetch questions")
        setLoading(false)
      }
    }

    // Function to handle submit-questions event
    const handleSubmitQuestions = (data: any) => {
      console.log("Received test results:", data)
      if (data.status === "success") {
        const currentQuestions = questionsRef.current
        const currentSelectedAnswers = selectedAnswersRef.current
        console.log("currentQuestions", currentQuestions)
        console.log("currentSelectedAnswers", currentSelectedAnswers)
        // Convert the results object into an array of questions
        const resultsArray = Object.values(data.result)

        // Process results for review mode
        const updatedQuestions = currentQuestions.map((q: any) => {
          const questionResult = data.result[q.id]
          if (!questionResult) return q

          return {
            ...q,
            explanation: questionResult.explaination || "",
            answer: questionResult.answer || "",
            isCorrect: questionResult.isCorrect,
          }
        })

        setQuestions(updatedQuestions)
        console.log("updatedQuestions", updatedQuestions)

        // Prepare correct answers in the expected format
        const correctAnswers: Record<string, string[]> = {}
        const formattedSelectedAnswers: Record<string, string[]> = {}

        // Process each question to build the answers and correctAnswers objects
        resultsArray.forEach((q: any) => {
          if (q.id) {
            const questionId = q.id.toString()

            // Get correct answers
            if (q.answer) {
              correctAnswers[questionId] = q.answer
                .toString()
                .split(",")
                .map((a: string) => a.trim())
            } else {
              correctAnswers[questionId] = []
            }

            // Find the user's answer for this question
            const questionIndex = currentQuestions.findIndex((question) => question.id === q.id)
            if (questionIndex >= 0 && questionIndex < currentSelectedAnswers.length) {
              const userAnswer = currentSelectedAnswers[questionIndex]
              if (userAnswer !== null) {
                formattedSelectedAnswers[questionId] = userAnswer.split(",").map((a) => a.trim())
              } else {
                formattedSelectedAnswers[questionId] = []
              }
            } else {
              formattedSelectedAnswers[questionId] = []
            }
          }
        })

        // Create the final test result object
        const testResult = {
          score: Math.max(0, Math.round(data.score * 100) / 100),
          totalQuestions: questions.length,
          negativeMarking,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
          answers: formattedSelectedAnswers,
          correctAnswers,
          status: data.status,
          userId: userId,
        }

        console.log("Processed test result:", testResult)

        // Set the test result in the context
        setTestResult(testResult)

        // Update the UI state
        setIsReviewMode(true)

        // Navigate to the results page
        navigate("/submit")
      } else {
        setError(data.message || "Failed to submit test")
      }
    }

    // Add event listeners
    console.log("Adding socket event listeners")
    socket.on("fetch-questions", handleFetchQuestions)
    socket.on("submit-questions", handleSubmitQuestions)

    // Clean up function - only runs when component unmounts
    return () => {
      console.log("Cleaning up socket event listeners (component unmount)")
      socket.off("fetch-questions", handleFetchQuestions)
      socket.off("submit-questions", handleSubmitQuestions)
    }
  }, [socket])

  const handleSubmitTest = useCallback(async () => {
    setTestStarted(false)
    console.log("request made for submit")

    if (!socket) {
      setError("Socket connection not established")
      return
    }

    try {
      // Prepare submissions for all questions
      console.log("testData", testData)
      console.log("questions", questions)
      const submissions = questions.map((q, index) => {
        // Get the answer if it's answered, otherwise use -1
        const answer = questionStatuses[index] === "ANSWERED" ? String(selectedAnswers[index]) : "-1"
        return {
          questionId: q.id,
          selectedOption: answer,
          // status: questionStatuses[index],
        }
      })
      console.log("Sending test submission:", {
        submissions,
        markingScheme,
        userId,
      })

      // Send POST request to /questions/submit
      const response = await fetch(`${apiUrl}/questions/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          submissions,
          markingScheme,
          userId,
        }),
      })
      console.log("made the post request")
      if (!response.ok) {
        throw new Error("Failed to submit test")
      }
      console.log("post request success")
      // The server will respond with results via the 'submit-questions' socket event
      // We don't need to do anything else here
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }, [
    questions,
    selectedAnswers,
    socket,
    startTime,
    setError,
    setTestStarted,
    questionStatuses,
    negativeMarking,
    apiUrl,
    markingScheme,
    userId,
    testData,
  ])

  return { socket, handleSubmitTest }
}
