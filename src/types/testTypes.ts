export type QuestionStatus = "NOT_VISITED" | "VISITED" | "SAVED_FOR_LATER" | "ANSWERED"

export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'INTEGER';

export type Question = {
  id: string
  question: string
  options: string[]
  answer?: string
  multipleCorrectType?: boolean
  explanation?: string
  categoryId?: string
  type: QuestionType  
}

export type QuestionResult = {
  id: string
  answer: string  
  type: QuestionType  
  isCorrect: boolean
  explanation?: string
}

export type TestResults = {
  score: number
  totalQuestions: number
  negativeMarking: boolean
  timeTaken: number
  answers: string[]  
  correctAnswers: Record<string, string[]>  
}
