import type React from "react"

import { useState, useEffect, useCallback } from "react"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { env } from "../config/env"
import type { Question, QuestionStatus, TestResults, QuestionType } from "../types/testTypes"

type UseSocketConnectionProps = {
  userId: string | null
  questions: Question[]
  selectedAnswers: (number | null | number[] | null)[]
  questionStatuses: QuestionStatus[]
  startTime: number
  negativeMarking: boolean
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
  setQuestionStatuses: React.Dispatch<React.SetStateAction<QuestionStatus[]>>
  setSelectedAnswers: React.Dispatch<React.SetStateAction<(number | null | number[] | null)[]>>
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

  useEffect(() => {
    if (!userId) return

    console.log("Initializing socket connection")
    const newSocket = io(env.SOCKET_URL, {
      path: "/socket.io",
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to socket")
      newSocket.emit("join_room", JSON.stringify({ userId: userId }))
    })

    return () => {
      console.log("Disconnecting socket")
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [userId]) // Only depend on userId

  useEffect(() => {
    if (!socket) return

    console.log("Setting up socket event listeners")
    
    socket.on("fetch-questions", (data: any) => {
      console.log("Received questions:", data)
      if (data.status === "success") {
        // Set proper type for each question based on its format
        const typedQuestions = data.questions.map((q: any) => {
          // Determine question type based on format
          const type: QuestionType = 
            q.multipleCorrectType ? 'MULTIPLE' :
            q.options && q.options.length > 0 ? 'SINGLE' :
            'INTEGER';
          
          return {
            ...q,
            type,
            // Ensure answer is properly typed
            answer: q.answer ? (typeof q.answer === 'number' ? q.answer.toString() : q.answer) : undefined
          };
        });
        
        setQuestions(typedQuestions)
        setQuestionStatuses(typedQuestions.map(() => "NOT_VISITED" as QuestionStatus))
        setSelectedAnswers(Array(typedQuestions.length).fill(null))
        setLoading(false)
      } else {
        setError(data.message || "Failed to fetch questions")
        setLoading(false)
      }
    })

    socket.on("submit-questions", (data: any) => {
      console.log("Received test results:", data)
      if (data.status === "success") {
        // Process results for review mode
        const updatedQuestions = questions.map((q: any) => {
            const result = data.result[q.id];
            return {
              ...q,
              explanation: result?.explanation,
              answer: result?.answer
            };
          });
          
          setQuestions(updatedQuestions);

          const correctAnswers = Object.entries(data.result).reduce<Record<string, string[]>>((acc, [questionId, result]) => {
            const correctAnswer = (result as { answer: string | string[] }).answer;
            acc[questionId] = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
            return acc;
          }, {});

          // Calculate score using isCorrect values
          const score = Object.entries(data.result as Record<string, any>).reduce<number>((total, [questionId, result]) => {
            const isCorrect = result.isCorrect;
            const questionIndex = questions.findIndex((q) => q.id === questionId);
            const selectedAnswer = selectedAnswers[questionIndex];
            const correctAnswer = (result as { answer: string | string[] }).answer;

            if (isCorrect) {
              return total + 1;
            }

            // Handle partial credit for multiple answer questions
            if (Array.isArray(selectedAnswer) && Array.isArray(correctAnswer)) {
              const correctCount = selectedAnswer.filter(answer => {
                if (typeof answer === 'number') {
                  return correctAnswer.includes(String(answer));
                }
                return correctAnswer.includes(answer);
              }).length;
              const totalCorrect = correctAnswer.length;
              
              // Give partial credit based on number of correct answers selected
              return total + (correctCount / totalCorrect);
            }

            return selectedAnswer !== null && negativeMarking ? total - 0.25 : total;
          }, 0);

          const results: TestResults = {
            score: Math.max(0, Math.round(score * 100) / 100),
            totalQuestions: questions.length,
            negativeMarking,
            timeTaken: Math.floor((Date.now() - startTime) / 1000),
            answers: selectedAnswers.map((answer) => 
              Array.isArray(answer) ? (answer as number[]).map(n => n.toString()) : answer?.toString() || null
            ),
            correctAnswers,
          }

          setTestResults(results);
          setIsReviewMode(true);
      } else {
        setError(data.message || "Failed to submit test");
      }
    })

    return () => {
      console.log("Removing socket event listeners")
      socket.off("fetch-questions")
      socket.off("submit-questions")
    }
  }, [socket, questions, selectedAnswers, negativeMarking, startTime, setQuestions, setQuestionStatuses, setSelectedAnswers, setLoading, setError, setIsReviewMode, setTestResults])

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
// Add this line before the fetch request
// console.log("Sending test submission:", {
//   submissions,
//   timeTaken,
//   negativeMarking
// });

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
