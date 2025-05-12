export interface Question {
    id: number
    text: string
    options: string[]
    correctAnswer?: number // Optional for now, can be used later for scoring
}
  
export enum QuestionStatus {
    NOT_VISITED = "NOT_VISITED",
    VISITED = "VISITED",
    SAVED_FOR_LATER = "SAVED_FOR_LATER",
    ANSWERED = "ANSWERED",
}
  