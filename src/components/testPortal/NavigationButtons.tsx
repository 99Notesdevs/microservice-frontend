"use client"

import React from "react"
import { Button } from "../ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type NavigationButtonsProps = {
  currentIndex: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ currentIndex, totalQuestions, onNext, onPrevious }) => {
  return (
    <div className="flex justify-between p-6 pt-0">
      <Button onClick={onPrevious} disabled={currentIndex === 0} variant="outline" className="flex items-center gap-1">
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
        variant="outline"
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default React.memo(NavigationButtons)
