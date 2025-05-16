export type QuestionStatus = "NOT_VISITED" | "VISITED" | "SAVED_FOR_LATER" | "ANSWERED"

export type Question = {
  id: string
  question: string
  options: string[]
  answer?: string | string[] | number  
  explanation?: string
  categoryId?: string
}

export type QuestionResult = {
  id: string
  answer: string | string[] | number  
  isCorrect: boolean
  explanation?: string
}

export type TestResults = {
  score: number
  totalQuestions: number
  negativeMarking: boolean
  timeTaken: number
  answers: (string | string[] | number | null)[]  
  correctAnswers: Record<string, string[] | number[]>  
}
