import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import Timer from "../components/testPortal/Timer"
import type { QuestionStatus, Question } from "../types/testTypes"
import { env } from '../config/env'
import Cookies from 'js-cookie'

const TestPortal: React.FC = () => {
  const navigate = useNavigate()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [testDuration, setTestDuration] = useState<number>(30 * 60); // Default to 30 minutes
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [testStarted, setTestStarted] = useState<boolean>(true) // Set to true when test starts

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const urlParams = new URLSearchParams(location.search);
      const categoryIds = urlParams.get('categoryIds');
      const limit = urlParams.get('limit') || '10';
      const timeLimit = urlParams.get('timeLimit') || '30';
      const negativeMarkingParam = urlParams.get('negativeMarking') === 'true';

      if (!categoryIds) throw new Error('No categories selected');

      // Update test duration based on URL parameter
      setTestDuration(parseInt(timeLimit) * 60);
      setNegativeMarking(negativeMarkingParam);

      const response = await fetch(
        `${env.API}/questions/practice?limit=${limit}&categoryIds=${categoryIds}`, 
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch questions');

      const apiResponse = await response.json();
      const data = apiResponse.data;
      setQuestions(data);
      setQuestionStatuses(data.map(() => 'NOT_VISITED' as QuestionStatus));
      setSelectedAnswers(Array(data.length).fill(null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions()
  }, [location.search])

  useEffect(() => {
    if (!testStarted) return;

    // Handle browser back/forward buttons
    const handlePopState = (_event: PopStateEvent) => {
      // Show confirmation dialog
      const confirmLeave = window.confirm(
        'Are you sure you want to leave the test? Your progress may be lost.'
      );
      
      if (!confirmLeave) {
        // Stay on the current page
        navigate(window.location.pathname, { replace: true });
      } else {
        // User confirmed, allow navigation
        setTestStarted(false);
        return;
      }
    };

    // Handle page refresh or tab close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (testStarted) {
        event.preventDefault();
        // Modern browsers require returnValue to be set
        event.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
        return event.returnValue;
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, testStarted]);

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
    if (questionStatuses[index] === 'NOT_VISITED') {
      const newStatuses = [...questionStatuses]
      newStatuses[index] = 'VISITED'
      setQuestionStatuses(newStatuses)
    }
  }

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleConfirmAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] !== null) {
      const newStatuses = [...questionStatuses]
      newStatuses[currentQuestionIndex] = 'ANSWERED'
      setQuestionStatuses(newStatuses)
    }
  }

  const handleSaveForLater = () => {
    const newStatuses = [...questionStatuses]
    newStatuses[currentQuestionIndex] = 'SAVED_FOR_LATER'
    setQuestionStatuses(newStatuses)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      if (questionStatuses[nextIndex] === 'NOT_VISITED') {
        const newStatuses = [...questionStatuses]
        newStatuses[nextIndex] = 'VISITED'
        setQuestionStatuses(newStatuses)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = useCallback(() => {
    // Set test as completed before navigation
    setTestStarted(false);
    
    const endTime = Date.now()
    const timeTaken = Math.floor((endTime - startTime) / 1000)

    // Calculate score based on negative marking setting
    const score = selectedAnswers.reduce<number>((total, answer, index) => {
      const isCorrect = String(answer) === questions[index].answer;
      if (isCorrect) {
        return total + 1;
      }
      // Apply negative marking if enabled
      return negativeMarking ? total - 1 : total;
    }, 0);

    const testResults = {
      score,
      totalQuestions: questions.length,
      negativeMarking,
      timeTaken,
      answers: selectedAnswers,
      questions,
      statuses: questionStatuses,
    }

    sessionStorage.setItem("testResults", JSON.stringify(testResults))
    navigate("/submit")
  }, [selectedAnswers, questionStatuses, questions, startTime, navigate, negativeMarking])

  // 👉 Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-medium">
        Loading questions...
      </div>
    )
  }

  // 👉 Show error with retry option
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchQuestions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Test</h1>
          <Timer 
            initialTime={testDuration} 
            onTimeEnd={handleSubmitTest} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Questions</h2>
            <QuestionGrid
              questions={questions}
              statuses={questionStatuses}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
            />

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
                  <span>Not visited</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                  <span>Visited but not confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2" />
                  <span>Saved for later</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                  <span>Answered and confirmed</span>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={handleSubmitTest}
            >
              Submit Test
            </button>
          </div>
          
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={questions[currentQuestionIndex]}
              selectedOption={selectedAnswers[currentQuestionIndex]}
              onOptionSelect={handleOptionSelect}
              onConfirmAnswer={handleConfirmAnswer}
              onSaveForLater={handleSaveForLater}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
            />

            <NavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPortal
