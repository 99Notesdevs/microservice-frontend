"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import type { NavigateFunction } from "react-router-dom"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { env } from "../config/env"
import type { Question, QuestionStatus, TestResults } from "../types/testTypes"

type UseSocketConnectionProps = {
  userId: string | null
  navigate: NavigateFunction
  questions: Question[]
  selectedAnswers: (number | null)[]
  questionStatuses: QuestionStatus[]
  startTime: number
  negativeMarking: boolean
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
  setQuestionStatuses: React.Dispatch<React.SetStateAction<QuestionStatus[]>>
  setSelectedAnswers: React.Dispatch<React.SetStateAction<(number | null)[]>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  setTestDuration: React.Dispatch<React.SetStateAction<number>>
  setNegativeMarking: React.Dispatch<React.SetStateAction<boolean>>
  setTestStarted: React.Dispatch<React.SetStateAction<boolean>>
  setIsReviewMode: React.Dispatch<React.SetStateAction<boolean>>
  setTestResults: React.Dispatch<React.SetStateAction<TestResults | null>>
}

export function useSocketConnection({
  userId,
  navigate,
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
}: UseSocketConnectionProps) {
  const [socket, setSocket] = useState<any>(null)
  const [score, setScore] = useState<number>(0)

  useEffect(() => {
    if (!userId) return

    const newSocket = io(env.SOCKET_URL, {
      path: "/socket.io",
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to socket")
      newSocket.emit("join_room", JSON.stringify({ userId: userId }))
    })

    newSocket.on("fetch-questions", (data: any) => {
      console.log("Received questions:", data)
      if (data.status === "success") {
        setQuestions(data.questions)
        setQuestionStatuses(data.questions.map(() => "NOT_VISITED" as QuestionStatus))
        setSelectedAnswers(Array(data.questions.length).fill(null))
        setLoading(false)
      } else {
        setError(data.message || "Failed to fetch questions")
        setLoading(false)
      }
    })

    newSocket.on("submit-questions", (data: any) => {
      console.log("Received test results:", data)
      if (data.status === "success") {
        // Process results for review mode
        const updatedQuestions = questions.map(q => {
            const result = data.result[q.id];  // Access directly as object property
            return {
              ...q,
              explanation: result?.explaination,  // Note: it's "explaination" in the data
              answer: result?.answer
            };
          });
          
          setQuestions(updatedQuestions);  // Update the questions state with full info
          
        const correctAnswers: Record<string, number> = {}

        // Extract correct answers from the result
        Object.entries(data.result).forEach(([questionId, _isCorrect]) => {
          const questionIndex = questions.findIndex((q) => q.id === questionId)
          if (questionIndex !== -1) {
            // If the server provides the correct answer index
            if (data.correctAnswers && data.correctAnswers[questionId] !== undefined) {
              correctAnswers[questionId] = data.correctAnswers[questionId]
            } else {
              // Fallback to the question's correctOption if available
              const question = questions[questionIndex]
              if (question.answer !== undefined) {
                correctAnswers[questionId] = Number(question.answer)
              }
            }
          }
        })

        // Calculate score using isCorrect values
        const score = Object.entries(data.result as Record<string, { isCorrect: boolean }>).reduce<number>((total, [questionId, result]) => {
          const isCorrect = result.isCorrect;
          const questionIndex = questions.findIndex((q) => q.id === questionId);
          const answer = selectedAnswers[questionIndex];

          if (isCorrect) {
            return total + 1;
          }
          return answer !== null && negativeMarking ? total - 0.25 : total;
        }, 0);
        setScore(score)
        const results: TestResults = {
          score,
          totalQuestions: questions.length,
          negativeMarking,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
          answers: selectedAnswers.map((answer) => answer?.toString() || null),
          correctAnswers,
        }

        setTestResults(results)
        setIsReviewMode(true)
      } else {
        setError(data.message || "Failed to submit test")
      }
      console.log("Received test results:", data)
      if (data.status === "success") {
        // Define the type for the result object
        type QuestionResult = {
          id: string;
          answer: string | number;
          isCorrect: boolean;
        };

        // Type the data.result object
        const resultArray = Object.values(data.result) as QuestionResult[];

        // Create correctAnswers object from result
        const correctAnswers: Record<string, number> = {};
        resultArray.forEach((question) => {
          correctAnswers[question.id] = Number(question.answer);
        });

        // Calculate score using isCorrect values
        // const score = resultArray.reduce<number>((total, question) => {
        //   if (question.isCorrect) {
        //     return total + 1;
        //   }
        //   return total;
        // }, 0);

        const results: TestResults = {
          score,
          totalQuestions: questions.length,
          negativeMarking,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
          answers: selectedAnswers.map((answer) => answer?.toString() || null),
          correctAnswers,
        }

        setTestResults(results)
        setIsReviewMode(true)
      } else {
        setError("Failed to get test results")
      }
    })

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [
    userId,
    navigate,
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
    setIsReviewMode,
    setTestResults,
  ])

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const urlParams = new URLSearchParams(window.location.search)
      const categoryIds = urlParams.get("categoryIds")
      const limit = urlParams.get("limit") || "10"
      const timeLimit = urlParams.get("timeLimit") || "30"
      const negativeMarkingParam = urlParams.get("negativeMarking") === "true"

      if (!categoryIds) throw new Error("No categories selected")

      setTestDuration(Number.parseInt(timeLimit) * 60)
      setNegativeMarking(negativeMarkingParam)

      if (!socket) {
        throw new Error("Socket connection not established")
      }

      const response = await fetch(`${env.API}/questions/test?limit=${limit}&categoryIds=${categoryIds}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }

      // The server will respond with questions via 'fetch-questions' event
      socket.emit("practice", {
        categoryIds,
        limit,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }, [socket, setLoading, setError, setTestDuration, setNegativeMarking])

  const handleSubmitTest = useCallback(async () => {
    setTestStarted(false)
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
          status: questionStatuses[index]
        }
      });

      // Send POST request to /questions/submit
      const response = await fetch(`${env.API}/questions/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          submissions,
          timeTaken,
          negativeMarking
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit test")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }, [questions, selectedAnswers, socket, userId, startTime, setError, setTestStarted, questionStatuses, negativeMarking])

  return { socket, fetchQuestions, handleSubmitTest }
}
