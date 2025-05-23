export interface Question {
  id: number
  question: string
  options: string[]
  answer: string // Can be a single value or comma-separated for multiple correct answers
  explaination?: string
  explanation?: string // Support both spellings
  creatorName?: string
  pyq?: boolean
  multipleCorrectType: boolean
  year?: number
  acceptance?: number
  rating?: number
  categoryId?: number
  type?: "SINGLE" | "MULTIPLE" | "INTEGER" // For socket integration
}

export interface TestSeriesObject {
  testId?: string
  testSeriesName?: string
}
export interface TestData {
  id?: number
  name: string
  questions: Question[]
  type: "testSeries" | "test" | "review"
}
export interface MarkingScheme {
  correct: number
  incorrect: number
  unattempted: number
  partial: number
  partialWrong: number
  partialUnattempted: number
}

export interface TestResult {
  id?: number
  score: number
  totalQuestions: number
  negativeMarking: boolean
  timeTaken: number
  answers: Record<string, string[]> // questionId -> array of selected answers
  correctAnswers: Record<string, string[]> // questionId -> array of correct answers
}

export interface UserAnswer {
  questionId: number
  selectedOptions: number[] // Array of selected option indices
  isCorrect: boolean
  isPartiallyCorrect?: boolean
}

export const QuestionStatus = {
  NOT_VISITED: "NOT_VISITED",
  VISITED: "VISITED",
  ANSWERED: "ANSWERED",
  SAVED_FOR_LATER: "SAVED_FOR_LATER"
} as const

export type QuestionStatus = (typeof QuestionStatus)[keyof typeof QuestionStatus]

export type SubmitFunction = (result: TestResult) => Promise<void> | void

// Socket integration types
export interface TestResults {
  score: number
  totalQuestions: number
  timeTaken: number
  answers: (string | null)[]
  correctAnswers: Record<string, string[]>
  negativeMarking: boolean
}

export interface TestConfig {
  fetchFunction: () => Promise<any>;
  submitFunction: (result: any) => Promise<void>;
  testDuration: number;
  testName: string;
  initialData?: any;
}
