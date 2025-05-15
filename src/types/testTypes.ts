export type QuestionStatus = "NOT_VISITED" | "VISITED" | "SAVED_FOR_LATER" | "ANSWERED"

export type Question = {
  id: string
  question: string
  options: string[]
  answer?: string
  explanation?: string
  categoryId?: string
}

export type TestResults = {
  score: number
  totalQuestions: number
  negativeMarking: boolean
  timeTaken: number
  answers: (string | null)[]
  correctAnswers?: Record<string, number>
}
