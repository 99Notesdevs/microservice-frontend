"use client"

import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { QuestionStatus, Question, TestResults } from "../types/testTypes"

export function useTestState() {
  const [searchParams] = useSearchParams()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [testDuration, setTestDuration] = useState<number>(30 * 60)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    () => Array(questions.length).fill('')
  )
  const [negativeMarking, setNegativeMarking] = useState<boolean>(
    searchParams.get('negativeMarking') === 'true'
  )
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false)
  const [testResults, setTestResults] = useState<TestResults | null>(null)

  return {
    currentQuestionIndex,
    testDuration,
    questions,
    loading,
    error,
    questionStatuses,
    selectedAnswers,
    negativeMarking,
    isReviewMode,
    testResults,
    setCurrentQuestionIndex,
    setTestDuration,
    setQuestions,
    setLoading,
    setError,
    setQuestionStatuses,
    setSelectedAnswers,
    setNegativeMarking,
    setIsReviewMode,
    setTestResults,
  }
}
