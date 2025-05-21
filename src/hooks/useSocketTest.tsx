"use client"

import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTestContext } from "../contexts/TestContext"
import { useSocketConnection } from "./use-socket-connection"
import Cookies from "js-cookie"
import { env } from "../config/env"

export function useSocketTest() {
  const navigate = useNavigate()
  const {
    testData,
    questionStatuses,
    selectedAnswers,
    startTime,
    negativeMarking,
    markingScheme,
    setQuestions,
    setQuestionStatuses,
    setSelectedAnswersFromSocket,
    setIsReviewMode,
    setTestResult,
    setNegativeMarking,
    setMarkingScheme
  } = useTestContext()

  // State setters for socket hook compatibility
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testDuration, setTestDuration] = useState(30 * 60) // 30 minutes default
  const [testStarted, setTestStarted] = useState(false)
  const [socketTestResults, setSocketTestResults] = useState(null)

  // Get userId from cookies or localStorage
  const userId = Cookies.get("userId") || localStorage.getItem("userId")

  // Map our questions and answers to the format expected by useSocketConnection
  const socketQuestions = testData?.questions || []
  const socketSelectedAnswers = selectedAnswers.map((answer) => {
    if (answer.selectedOptions.length === 0) return null
    return answer.selectedOptions.join(",")
  })

  // Initialize socket connection
  const {
    // socket,
    handleSubmitTest: socketSubmitTest,
  } = useSocketConnection({
    userId,
    questions: socketQuestions,
    selectedAnswers: socketSelectedAnswers,
    questionStatuses,
    startTime,
    negativeMarking,
    setQuestions: (questions) => {
      // Map socket questions to our format
      const mappedQuestions = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options || [],
        answer: q.answer || "",
        explaination: q.explanation || q.explaination || "",
        multipleCorrectType: q.type === "MULTIPLE" || q.multipleCorrectType || false,
        // Add other fields as needed
      }))
      setQuestions(mappedQuestions)
    },
    setQuestionStatuses,
    setSelectedAnswers: setSelectedAnswersFromSocket,
    setLoading,
    setError,
    setTestDuration,
    setNegativeMarking,
    setTestStarted,
    setIsReviewMode,
    setTestResults: (results) => {
      if (!results) return

      // Map socket results to our format
      const mappedResult = {
        name: testData?.name || "Socket Test",
        correctAttempted: 0, // Calculate from results
        wrongAttempted: 0,
        notAttempted: results.totalQuestions - results.answers.filter((a: string | null) => a !== null).length,
        timeTaken: results.timeTaken,
        questionsSingle: socketQuestions.filter((q) => !q.multipleCorrectType).length,
        questionsMultiple: socketQuestions.filter((q) => q.multipleCorrectType).length,
        answers: selectedAnswers,
        negativeMarking: results.negativeMarking,
        score: results.score,
      }

      // Calculate correct and wrong answers
      socketQuestions.forEach((question, index) => {
        const userAnswer = results.answers[index]
        const correctAnswer = results.correctAnswers[question.id]

        if (!userAnswer) return // Not attempted

        const isCorrect = Array.isArray(correctAnswer)
          ? correctAnswer.includes(userAnswer)
          : correctAnswer === userAnswer

        if (isCorrect) {
          mappedResult.correctAttempted++
        } else {
          mappedResult.wrongAttempted++
        }
      })

      setTestResult(mappedResult)
      setSocketTestResults(results)
    },
  })

  // Start socket test - follows the workflow you described
  const startSocketTest = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const categoryIds = urlParams.get("categoryIds")
      const limit = urlParams.get("limit") || "10"
      const timeLimit = urlParams.get("timeLimit") || "30"
      const negativeMarkingParam = urlParams.get("negativeMarking") === "true"
      const correctAttempted = urlParams.get("correctAttempted") || "0"
      const wrongAttempted = urlParams.get("wrongAttempted") || "0"
      const notAttempted = urlParams.get("notAttempted") || "0"
      const partialAttempted = urlParams.get("partialAttempted") || "0"
      const partialNotAttempted = urlParams.get("partialNotAttempted") || "0"
      const partialWrongAttempted = urlParams.get("partialWrongAttempted") || "0"
      const markingScheme = {
        correct: Number.parseInt(correctAttempted),
        incorrect: Number.parseInt(wrongAttempted),
        unattempted: Number.parseInt(notAttempted),
        partial: Number.parseInt(partialAttempted),
        partialWrong: Number.parseInt(partialNotAttempted),
        partialUnattempted: Number.parseInt(partialWrongAttempted),
      }
      if (!categoryIds) throw new Error("No categories selected")

      // Set test parameters
      setTestDuration(Number.parseInt(timeLimit) * 60)
      setNegativeMarking(negativeMarkingParam)
      setMarkingScheme(markingScheme) 
      // First make the HTTP request to queue the questions
      const response = await fetch(`${env.API}/questions/test?limit=${limit}&categoryIds=${categoryIds}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })
     
      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }

      console.log("HTTP request successful, now fetching questions via socket")

      // Then fetch questions via socket
      setTestStarted(true)
      // fetchQuestions()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }, [setNegativeMarking, setTestDuration])

  // Submit socket test - follows the workflow you described
  const submitSocketTest = useCallback(async () => {
    try {
      console.log("Submitting test via socket")
      // This will make the POST request to /questions/submit
      // and then handle the socket response
      setLoading(true)
      console.log("request made for submit")
      await socketSubmitTest()

      // Add a small delay to ensure the socket response is processed
      // setTimeout(() => {
      //   // console.log("Navigating to submit page after test submission")
      //   // navigate("/submit")
      // }, 500)
      console.log("Test submitted successfully came out of SocketSubmitTest")
    } catch (error) {
      setError("Failed to submit test")
      setLoading(false)
    }
  }, [socketSubmitTest, navigate, setError])

  return {
    loading,
    error,
    testDuration,
    testStarted,
    startSocketTest,
    submitSocketTest,
    socketTestResults,
  }
}
