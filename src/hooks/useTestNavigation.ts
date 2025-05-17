import type React from "react"
import { useEffect } from "react"

import { useState, useCallback } from "react"
import type { QuestionStatus, Question } from "../types/testTypes"

type UseTestNavigationProps = {
  questions: Question[]
  questionStatuses: QuestionStatus[]
  selectedAnswers: string[]
  currentQuestionIndex: number
  isReviewMode: boolean
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>
  setQuestionStatuses: React.Dispatch<React.SetStateAction<QuestionStatus[]>>
  setSelectedAnswers: React.Dispatch<React.SetStateAction<string[]>>
  onOptionSelect?: (optionIndex: string | number) => void
}

export function useTestNavigation({
  questions,
  questionStatuses,
  selectedAnswers,
  currentQuestionIndex,
  isReviewMode,
  setCurrentQuestionIndex,
  setQuestionStatuses,
  setSelectedAnswers,
  onOptionSelect,
}: UseTestNavigationProps) {
  const [testStarted, setTestStarted] = useState<boolean>(true)
  const [tempAnswer, setTempAnswer] = useState<string | number | null>(null)

  // Load saved states from localStorage
  useEffect(() => {
    const savedStatuses = localStorage.getItem('questionStatuses')
    const savedAnswers = localStorage.getItem('selectedAnswers')
    
    if (savedStatuses) {
      setQuestionStatuses(JSON.parse(savedStatuses))
    }
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers))
    }
  }, [setQuestionStatuses, setSelectedAnswers])

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('questionStatuses', JSON.stringify(questionStatuses))
    localStorage.setItem('selectedAnswers', JSON.stringify(selectedAnswers))
  }, [questionStatuses, selectedAnswers])

  const handleQuestionSelect = useCallback(
    (index: number) => {
      setCurrentQuestionIndex(index)
      if (!isReviewMode) {
        setQuestionStatuses(prev => {
          const newStatuses = [...prev]
          // If question was NOT_VISITED or SAVED_FOR_LATER, mark it as VISITED
          if (newStatuses[index] === "NOT_VISITED" || newStatuses[index] === "SAVED_FOR_LATER") {
            newStatuses[index] = "VISITED"
          }
          return newStatuses
        })
      }
    },
    [setCurrentQuestionIndex, setQuestionStatuses, isReviewMode],
  )

  const handleOptionSelect = useCallback(
    (optionIndex: string | number) => {
      if (isReviewMode) return
      
      // Allow changing options even if question is answered
      setTempAnswer(optionIndex)
      if (onOptionSelect) onOptionSelect(optionIndex)
    },
    [isReviewMode, onOptionSelect]
  )

  const handleConfirmAnswer = useCallback(() => {
    if (isReviewMode || tempAnswer === null) return

    // Update selected answers
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = tempAnswer.toString()
    setSelectedAnswers(newAnswers)

    // Update status to ANSWERED
    const newStatuses = [...questionStatuses]
    // If it was saved for later, clear the status first
    if (newStatuses[currentQuestionIndex] === "SAVED_FOR_LATER") {
      newStatuses[currentQuestionIndex] = "VISITED"
    }
    newStatuses[currentQuestionIndex] = "ANSWERED"
    setQuestionStatuses(newStatuses)

    // Clear temporary answer
    setTempAnswer(null)
  }, [selectedAnswers, currentQuestionIndex, setSelectedAnswers, questionStatuses, setQuestionStatuses, isReviewMode, tempAnswer])

  const handleSaveForLater = useCallback(() => {
    if (isReviewMode) return

    setQuestionStatuses(prev => {
      const newStatuses = [...prev]
      // If we have an answer, clear it when saving for later
      if (selectedAnswers[currentQuestionIndex] !== null) {
        setSelectedAnswers(prevAnswers => {
          const newAnswers = [...prevAnswers]
          newAnswers[currentQuestionIndex] = ''
          localStorage.setItem('selectedAnswers', JSON.stringify(newAnswers))
          return newAnswers
        })
      }
      
      newStatuses[currentQuestionIndex] = "SAVED_FOR_LATER"
      localStorage.setItem('questionStatuses', JSON.stringify(newStatuses))
      return newStatuses
    })
  }, [currentQuestionIndex, questionStatuses, isReviewMode, selectedAnswers])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      if (!isReviewMode && questionStatuses[nextIndex] === "NOT_VISITED") {
        setQuestionStatuses(prev => {
          const newStatuses = [...prev]
          newStatuses[nextIndex] = "VISITED"
          return newStatuses
        })
      }
    }
  }, [
    currentQuestionIndex,
    questions.length,
    questionStatuses,
    setCurrentQuestionIndex,
    setQuestionStatuses,
    isReviewMode,
  ])

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex])

  return {
    testStarted,
    setTestStarted,
    handleQuestionSelect,
    handleOptionSelect,
    handleConfirmAnswer,
    handleSaveForLater,
    handleNext,
    handlePrevious,
  }
}
