"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type TestData,
  type TestResult,
  QuestionStatus,
  type UserAnswer,
  type SubmitFunction,
  type Question,
  type MarkingScheme,
} from "../types/testTypes"

interface TestContextProps {
  testData: TestData | null
  currentQuestionIndex: number
  questionStatuses: QuestionStatus[]
  selectedAnswers: UserAnswer[]
  startTime: number
  isReviewMode: boolean
  testResult: TestResult | null
  negativeMarking: boolean
  markingScheme: MarkingScheme | null

  // Actions
  setTestData: (data: TestData) => void
  setCurrentQuestionIndex: (index: number) => void
  handleQuestionSelect: (index: number) => void
  handleOptionSelect: (questionId: number, optionIndex: number) => void
  handleConfirmAnswer: () => void
  handleSaveForLater: () => void
  handleSubmitTest: (submitFn?: SubmitFunction) => void
  setIsReviewMode: (isReview: boolean) => void
  setTestResult: (result: TestResult | null) => void
  setNegativeMarking: (value: boolean) => void
  setMarkingScheme: (scheme: MarkingScheme | null) => void

  // Socket integration
  setQuestions: (questions: Question[]) => void
  setQuestionStatuses: (statuses: QuestionStatus[]) => void
  setSelectedAnswersFromSocket: (answers: (string | null)[]) => void
}

const TestContext = createContext<TestContextProps | undefined>(undefined)

export const useTestContext = () => {
  const context = useContext(TestContext)
  if (!context) {
    throw new Error("useTestContext must be used within a TestProvider")
  }
  return context
}

interface TestProviderProps {
  children: ReactNode
}

export const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<UserAnswer[]>([])
  const [startTime] = useState<number>(Date.now())
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false)
  const [markingScheme, setMarkingScheme] = useState<MarkingScheme | null>(null)

  // Initialize question statuses and selected answers when test data changes
  useEffect(() => {
    if (testData) {
      // Initialize question statuses
      setQuestionStatuses(testData.questions.map(() => QuestionStatus.NOT_VISITED))

      // Initialize selected answers
      setSelectedAnswers(
        testData.questions.map((question) => ({
          questionId: question.id,
          selectedOptions: [],
          isCorrect: false,
        })),
      )
    }
  }, [testData])

  const handleQuestionSelect = (index: number) => {
    // Update current question
    setCurrentQuestionIndex(index)

    // Update status if not visited
    if (questionStatuses[index] === QuestionStatus.NOT_VISITED) {
      const newStatuses = [...questionStatuses]
      newStatuses[index] = QuestionStatus.VISITED
      setQuestionStatuses(newStatuses)
    }
  }

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (!testData) return

    const questionIndex = testData.questions.findIndex((q) => q.id === questionId)
    if (questionIndex === -1) return

    const question = testData.questions[questionIndex]
    const isMultipleCorrect = question.multipleCorrectType

    setSelectedAnswers((prev) => {
      const newAnswers = [...prev]
      const answerIndex = newAnswers.findIndex((a) => a.questionId === questionId)

      if (answerIndex !== -1) {
        const currentAnswer = newAnswers[answerIndex]

        if (isMultipleCorrect) {
          // For multiple correct questions, toggle the selection
          const selectedOptions = [...currentAnswer.selectedOptions]
          const optionPosition = selectedOptions.indexOf(optionIndex)

          if (optionPosition === -1) {
            selectedOptions.push(optionIndex)
          } else {
            selectedOptions.splice(optionPosition, 1)
          }

          newAnswers[answerIndex] = {
            ...currentAnswer,
            selectedOptions,
          }
        } else {
          // For single correct questions, replace the selection
          newAnswers[answerIndex] = {
            ...currentAnswer,
            selectedOptions: [optionIndex],
          }
        }
      }

      return newAnswers
    })
  }

  const handleConfirmAnswer = () => {
    if (!testData) return

    const currentQuestion = testData.questions[currentQuestionIndex]
    const currentAnswer = selectedAnswers.find((a) => a.questionId === currentQuestion.id)

    if (currentAnswer && currentAnswer.selectedOptions.length > 0) {
      // Update question status
      const newStatuses = [...questionStatuses]
      newStatuses[currentQuestionIndex] = QuestionStatus.ANSWERED
      setQuestionStatuses(newStatuses)

      // Check if answer is correct
      const correctAnswers = currentQuestion.answer.split(",").map(Number)
      const isCorrect = checkAnswerCorrectness(
        currentAnswer.selectedOptions,
        correctAnswers,
        currentQuestion.multipleCorrectType,
      )

      // Update selected answers with correctness
      setSelectedAnswers((prev) => {
        const newAnswers = [...prev]
        const answerIndex = newAnswers.findIndex((a) => a.questionId === currentQuestion.id)

        if (answerIndex !== -1) {
          newAnswers[answerIndex] = {
            ...newAnswers[answerIndex],
            isCorrect,
            isPartiallyCorrect: currentQuestion.multipleCorrectType
              ? checkPartialCorrectness(currentAnswer.selectedOptions, correctAnswers)
              : undefined,
          }
        }

        return newAnswers
      })

      // Move to next question if not at last question
      if (currentQuestionIndex < testData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    }
  }

  const checkAnswerCorrectness = (
    selectedOptions: number[],
    correctOptions: number[],
    isMultipleCorrect: boolean,
  ): boolean => {
    if (isMultipleCorrect) {
      // For multiple correct, all correct options must be selected and no incorrect ones
      return (
        selectedOptions.length === correctOptions.length &&
        selectedOptions.every((option) => correctOptions.includes(option))
      )
    } else {
      // For single correct, the selected option must match the correct one
      return selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0])
    }
  }

  const checkPartialCorrectness = (selectedOptions: number[], correctOptions: number[]): boolean => {
    // Partial correctness: at least one correct option selected and not all incorrect
    const hasCorrect = selectedOptions.some((option) => correctOptions.includes(option))
    const allCorrect =
      selectedOptions.length === correctOptions.length &&
      selectedOptions.every((option) => correctOptions.includes(option))

    return hasCorrect && !allCorrect
  }

  const handleSaveForLater = () => {
    const newStatuses = [...questionStatuses]
    newStatuses[currentQuestionIndex] = QuestionStatus.SAVED_FOR_LATER
    setQuestionStatuses(newStatuses)
  }

  const handleSubmitTest = (submitFn?: SubmitFunction) => {
    if (!testData) return

    const endTime = Date.now()
    const timeTaken = Math.floor((endTime - startTime) / 1000) // Time taken in seconds

    // Count single and multiple choice questions
    const questionsSingle = testData.questions.filter((q) => !q.multipleCorrectType).length
    const questionsMultiple = testData.questions.filter((q) => q.multipleCorrectType).length

    // Calculate statistics
    let correctAttempted = 0
    let wrongAttempted = 0
    let notAttempted = 0
    let partialAttempted = 0

    testData.questions.forEach((question, index) => {
      const status = questionStatuses[index]
      const answer = selectedAnswers.find((a) => a.questionId === question.id)

      if (status === QuestionStatus.ANSWERED && answer) {
        if (answer.isCorrect) {
          correctAttempted++
        } else if (answer.isPartiallyCorrect) {
          partialAttempted++
        } else {
          wrongAttempted++
        }
      } else {
        notAttempted++
      }
    })

    // Create test result
    const result: TestResult = {
      name: testData.name,
      correctAttempted,
      wrongAttempted,
      notAttempted,
      partialAttempted: partialAttempted || undefined,
      timeTaken,
      questionsSingle,
      questionsMultiple: questionsMultiple || undefined,
      answers: selectedAnswers,
      negativeMarking,
    }

    // Set the result in state
    setTestResult(result)

    // Call the provided submit function if any
    if (submitFn) {
      submitFn(result)
    }
  }

  // Socket integration methods
  const setQuestions = (questions: Question[]) => {
    if (!questions || questions.length === 0) return

    setTestData({
      id: 0,
      name: "Socket Test",
      questions,
      type: "test",
    })
  }

  const setSelectedAnswersFromSocket = (answers: (string | null)[]) => {
    if (!testData || !answers) return

    const formattedAnswers = testData.questions.map((question, index) => {
      const socketAnswer = answers[index]
      let selectedOptions: number[] = []

      if (socketAnswer !== null) {
        // Handle both single and multiple answers
        if (socketAnswer.includes(",")) {
          selectedOptions = socketAnswer.split(",").map(Number)
        } else {
          const option = Number(socketAnswer)
          if (!isNaN(option)) {
            selectedOptions = [option]
          }
        }
      }

      return {
        questionId: question.id,
        selectedOptions,
        isCorrect: false, // Will be calculated later
      }
    })

    setSelectedAnswers(formattedAnswers)
  }

  const value = {
    testData,
    currentQuestionIndex,
    questionStatuses,
    selectedAnswers,
    startTime,
    isReviewMode,
    testResult,
    negativeMarking,
    markingScheme,

    setTestData,
    setCurrentQuestionIndex,
    handleQuestionSelect,
    handleOptionSelect,
    handleConfirmAnswer,
    handleSaveForLater,
    handleSubmitTest,
    setIsReviewMode,
    setTestResult,
    setNegativeMarking,

    // Socket integration
    setQuestions,
    setQuestionStatuses,
    setSelectedAnswersFromSocket,
    setMarkingScheme,
  }

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>
}
