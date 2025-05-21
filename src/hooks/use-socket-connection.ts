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
      console.log("data.score", data.score)
      console.log("data.result", data.result)
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
        const score = data.score

        const results = {
          score: Math.max(0, Math.round(score * 100) / 100),
          totalQuestions: questions.length,
          negativeMarking,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
          answers: selectedAnswers,
          correctAnswers,
        }
        console.log("results", results)
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
