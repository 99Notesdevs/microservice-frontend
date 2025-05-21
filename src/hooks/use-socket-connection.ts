"use client"

import { useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import type { QuestionStatus } from "../types/testTypes"
import { useSocket } from "../contexts/SocketContext"
import { env } from "../config/env"
import { useTestContext } from "../contexts/TestContext"
import  {useAuth}  from "../contexts/AuthContext"
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
  setTestDuration,
  setNegativeMarking,
  setTestStarted,
  setIsReviewMode,
  setTestResults,
}: UseSocketConnectionProps) => {
  const { socket } = useSocket() // Use the shared socket from context
  const apiUrl = env.API || "http://localhost:5000/api"
  const {markingScheme} = useTestContext()
  const {user} = useAuth()
  const userId = user?.id

  // Use refs to track if event listeners are already set up
//   const fetchQuestionsListenerSet = useRef(false)
//   const submitQuestionsListenerSet = useRef(false)

  // Replace the entire useEffect hook that sets up event listeners with this more stable version
  // This will prevent the constant reconnections and event listener setup/teardown

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
        // Process results for review mode
        const updatedQuestions = questions.map((q: any) => {
          const result = data.result[q.id]
          return {
            ...q,
            explanation: result?.explanation,
            answer: result?.answer,
          }
        })

        setQuestions(updatedQuestions)

        const correctAnswers = Object.entries(data.result).reduce<Record<string, string[]>>(
          (acc, [questionId, result]) => {
            const correctAnswer = (result as any).answer || ""
            acc[questionId] = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
            return acc
          },
          {},
        )

        // Calculate score using isCorrect values
        const score = Object.entries(data.result as Record<string, any>).reduce<number>(
          (total, [questionId, result]) => {
            const isCorrect = result.isCorrect
            const questionIndex = questions.findIndex((q) => q.id === questionId)
            const selectedAnswer = selectedAnswers[questionIndex]
            const correctAnswer = result?.answer || ""

            if (isCorrect) {
              return total + 1
            }

            // Handle partial credit for multiple answer questions
            if (selectedAnswer && Array.isArray(selectedAnswer)) {
              const correctCount = selectedAnswer.filter((answer) => correctAnswer.includes(answer)).length
              const totalCorrect = correctAnswer.length

              // Give partial credit based on number of correct answers selected
              return total + correctCount / totalCorrect
            }

            return selectedAnswer !== null && negativeMarking ? total - 0.25 : total
          },
          0,
        )

        const results = {
          score: Math.max(0, Math.round(score * 100) / 100),
          totalQuestions: questions.length,
          negativeMarking,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
          answers: selectedAnswers,
          correctAnswers,
        }

        setTestResults(results)
        setIsReviewMode(true)
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
  }, [socket]) // Only depend on socket, not on any other state variables

  // const fetchQuestions = useCallback(async () => {
  //   try {
  //     setLoading(true)
  //     setError(null)

  //     const urlParams = new URLSearchParams(window.location.search)
  //     const categoryIds = urlParams.get("categoryIds")
  //     const limit = urlParams.get("limit") || "10"
  //     const timeLimit = urlParams.get("timeLimit") || "30"
  //     const negativeMarkingParam = urlParams.get("negativeMarking") === "true"

  //     if (!categoryIds) throw new Error("No categories selected")

  //     setTestDuration(Number.parseInt(timeLimit) * 60)
  //     setNegativeMarking(negativeMarkingParam)

  //     if (!socket) {
  //       throw new Error("Socket connection not established")
  //     }

  //     // The HTTP request is now made in the useSocketTest hook
  //     // Here we just emit the socket event
  //     console.log("Emitting practice event to socket")
  //     // socket.emit("practice", {
  //     //   categoryIds,
  //     //   limit,
  //     // })
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Something went wrong")
  //     setLoading(false)
  //   }
  // }, [socket, setLoading, setError, setTestDuration, setNegativeMarking])

  const handleSubmitTest = useCallback(async () => {
    setTestStarted(false)
    console.log("request made for submit")
    const endTime = Date.now()
    const timeTaken = Math.floor((endTime - startTime) / 1000)

    if (!socket) {
      setError("Socket connection not established")
      return
    }

    try {
      // Prepare submissions for all questions
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
        userId
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
          userId
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
    userId
  ])

  return { socket, handleSubmitTest }
}
