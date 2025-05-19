"use client"

import type React from "react"
import { QuestionStatus } from "../../types/testTypes"

interface TestStatusPanelProps {
  questionStatuses: QuestionStatus[]
  isReviewMode?: boolean
}

const TestStatusPanel: React.FC<TestStatusPanelProps> = ({ questionStatuses, isReviewMode = false }) => {
  // Count questions by status
  const answeredCount = questionStatuses.filter((status) => status === QuestionStatus.ANSWERED).length
  const notVisitedCount = questionStatuses.filter((status) => status === QuestionStatus.NOT_VISITED).length
  const visitedCount = questionStatuses.filter((status) => status === QuestionStatus.VISITED).length
  const markedForReviewCount = questionStatuses.filter((status) => status === QuestionStatus.SAVED_FOR_LATER).length
  const totalCount = questionStatuses.length

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium text-gray-800 mb-3">Test Summary</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Answered</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm">{answeredCount}</span>
            <span className="text-xs text-gray-500 ml-1">/ {totalCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Not Answered</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm">{visitedCount}</span>
            <span className="text-xs text-gray-500 ml-1">/ {totalCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
            <span className="text-sm">Marked for Review</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm">{markedForReviewCount}</span>
            <span className="text-xs text-gray-500 ml-1">/ {totalCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span className="text-sm">Not Visited</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm">{notVisitedCount}</span>
            <span className="text-xs text-gray-500 ml-1">/ {totalCount}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Not Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span>Not Visited</span>
          </div>
          {isReviewMode && (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-300 rounded mr-2"></div>
                <span>Partially Correct</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestStatusPanel
