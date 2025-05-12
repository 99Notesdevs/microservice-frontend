export interface Question {
    id: number
    question: string
    options: string[]
    answer?: string // Optional for now, can be used later for scoring
}
  
export type QuestionStatus = 
  | 'NOT_VISITED'
  | 'VISITED'
  | 'SAVED_FOR_LATER'
  | 'ANSWERED';