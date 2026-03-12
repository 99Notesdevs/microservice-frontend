import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CategorySelect from "@/components/testUtils/CategorySelect";
import { api } from "@/api/route";

interface Question {
  id: string;
  question: string;
  answer: string;
  options: string[];
  categoryId: number;
  explaination: string;
  creatorName: string;
  multipleCorrectType: boolean;
  pyq: boolean;
  year: number | null;
  rating: number | null;
}

export default function EditQuestionPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    questionId: string | null;
  }>({ isOpen: false, questionId: null });

  // Fetch questions for selected category
  useEffect(() => {
    if (!selectedCategory) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/questions/?categoryId=${selectedCategory}&limit=${pageSize}`);
        const typedResponse = response as { success: boolean; data: any };
        
        if (!typedResponse.success) throw new Error("Failed to fetch questions");
        const { data } = typedResponse;
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedCategory, pageSize]);

  const handleDeleteQuestion = async () => {
    if (!deleteConfirmation.questionId) return;
    
    try {
      const response = await api.delete(`/questions/${deleteConfirmation.questionId}`);
      const typedResponse = response as { success: boolean; data: any };
      if (!typedResponse.success) throw new Error('Failed to delete question');

      // Remove the question from the local state
      setQuestions(prev => prev.filter(q => q.id !== deleteConfirmation.questionId));
      
      // Close the confirmation dialog
      setDeleteConfirmation({ isOpen: false, questionId: null });
      
      alert('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
      setDeleteConfirmation({ isOpen: false, questionId: null });
    }
  };

  const handleEditQuestion = (question: Question) => {
    // For now, we'll just show an alert. In a real implementation, 
    // you would navigate to an edit form or open a modal
    alert(`Edit functionality for question ID: ${question.id}\n\nThis would open an edit form with the question data.`);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-12 px-4 md:px-8 flex flex-col items-center">
      <style>{`
        .question-content {
          max-height: 150px;
          overflow-y: auto;
        }
        .question-content table {
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
          width: 100%;
        }
        .question-content td,
        .question-content th {
          padding: 0.5rem;
        }
        .question-content th {
          background-color: #f9fafb;
        }
        .question-content tr:not(:last-child) {
          border-bottom: 1px solid #f3f4f6;
        }
      `}</style>
      
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-center text-gray-900 drop-shadow-sm tracking-tight mb-8">
          Edit & Delete Questions
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Category Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Category</h2>
            <CategorySelect
              selectedCategoryId={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading questions...</p>
            </div>
          )}

          {/* No Category Selected */}
          {!selectedCategory && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Please select a category to view questions</p>
            </div>
          )}

          {/* Questions List */}
          {selectedCategory && !loading && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Questions {questions.length > 0 && `(${questions.length})`}
              </h2>
              
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No questions found for this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          {/* Question Content */}
                          <div className="flex-1 min-w-0 space-y-4">
                            {/* Question Text */}
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">Question:</h3>
                              <div 
                                className="question-content text-sm text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: question.question }}
                              />
                            </div>

                            {/* Options */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Options:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {question.options.map((opt, idx) => (
                                  <div 
                                    key={idx}
                                    className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                                  >
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold text-xs">
                                      {idx + 1}
                                    </span>
                                    <div 
                                      className="text-xs text-gray-700 leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: opt }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Answer and Metadata */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded border border-green-100">
                                Answer: {question.answer}
                              </div>
                              {question.pyq && question.year && (
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded border border-blue-100">
                                  PYQ: {question.year}
                                </div>
                              )}
                              {question.rating && (
                                <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm font-medium rounded border border-yellow-100">
                                  Rating: {question.rating}
                                </div>
                              )}
                              {question.multipleCorrectType && (
                                <div className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded border border-purple-100">
                                  Multiple Correct
                                </div>
                              )}
                            </div>

                            {/* Explanation */}
                            {question.explaination && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Explanation:</h4>
                                <div 
                                  className="question-content text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200"
                                  dangerouslySetInnerHTML={{ __html: question.explaination }}
                                />
                              </div>
                            )}

                            {/* Creator Info */}
                            <div className="text-xs text-gray-500">
                              Created by: {question.creatorName}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
                              onClick={() => setDeleteConfirmation({ isOpen: true, questionId: question.id })}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Question</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, questionId: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQuestion}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}