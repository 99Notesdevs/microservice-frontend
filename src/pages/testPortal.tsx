import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionGrid from "../components/testPortal/QuestionGrid"
import QuestionDisplay from "../components/testPortal/QuestionDisplay"
import NavigationButtons from "../components/testPortal/NavigationButtons"
import Timer from "../components/testPortal/Timer"
import type { QuestionStatus, Question } from "../types/testTypes"
import { env } from '../config/env'
import Cookies from 'js-cookie'
import  io from 'socket.io-client';

// Custom hook for socket connection
const useSocket = (userId: string | null) => {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(env.SOCKET_URL, {
      path: '/socket.io'
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join_room', JSON.stringify({ userId: userId }));
      console.log('Connected to socket and joined room:', userId);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [userId]);

  return socket;
};

const TestPortal: React.FC = () => {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId');
  const socket = useSocket(userId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [testDuration, setTestDuration] = useState<number>(30 * 60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [testStarted, setTestStarted] = useState<boolean>(true);

  useEffect(() => {
    if (socket) {
      // Set up event handlers
      socket.on('fetch-questions', (data: any) => {
        console.log('Received questions:', data);
        if (data.status === 'success') {
          setQuestions(data.questions);
          setQuestionStatuses(data.questions.map(() => 'NOT_VISITED' as QuestionStatus));
          setSelectedAnswers(Array(data.questions.length).fill(null));
          setLoading(false);
        } else {
          setError(data.message || 'Failed to fetch questions');
          setLoading(false);
        }
      });

      socket.on('submit-questions', (data: any) => {
        console.log('Received test results:', data);
        if (data.status === 'success') {
          const score = selectedAnswers.reduce<number>((total, _answer, index) => {
            const questionId = questions[index].id;
            if (data.result[questionId]) {
              return total + 1;
            }
            return negativeMarking ? total - 1 : total;
          }, 0);

          const testResults = {
            score,
            totalQuestions: questions.length,
            negativeMarking,
            timeTaken: Math.floor((Date.now() - startTime) / 1000),
            answers: selectedAnswers,
            questions,
            statuses: questionStatuses,
          };

          sessionStorage.setItem("testResults", JSON.stringify(testResults));
          navigate("/submit");
        } else {
          setError(data.message || 'Failed to submit test');
        }
      });

      return () => {
        if (socket) {
          socket.off('fetch-questions');
          socket.off('submit-questions');
        }
      };
    }
  }, [socket, navigate, selectedAnswers, questions, startTime, negativeMarking]);

  useEffect(() => {
    if (socket) {
      fetchQuestions();
    }
  }, [socket, location.search]);

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
  }, [userId]);

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

      setTestDuration(parseInt(timeLimit) * 60);
      setNegativeMarking(negativeMarkingParam);

      if (!socket) {
        throw new Error('Socket connection not established');
      }

      const response = await fetch(`${env.API}/questions/test?limit=${limit}&categoryIds=${categoryIds}`, {
        method: 'GET',
        headers:{'Authorization': `Bearer ${Cookies.get('token')}`}
      });
      if(!response.ok){
        throw new Error('Failed to fetch questions');
      }
      console.log('Sending request to /practice with:', {
        categoryIds,
        limit
      });

      // The server will respond with questions via 'fetch-questions' event
      socket.emit('practice', {
        categoryIds,
        limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    setTestStarted(false);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    if (!socket) {
      setError('Socket connection not established');
      return;
    }

    try {
      // Send POST request to /questions/submit
      const response = await fetch(`${env.API}/questions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({
          submissions: questions.map((q, index) => ({
            questionId: q.id,
            selectedOption: String(selectedAnswers[index])
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      // Wait for the socket response
      socket.on('test_results', (data: any) => {
        console.log('Received test results:', data);
        if (data.status === 'success') {
          // Handle the array of questionId mapped with true/false
          const score = selectedAnswers.reduce<number>((total, _answer, index) => {
            const questionId = questions[index].id;
            if (data.results[questionId]) {
              return total + 1;
            }
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
            results: data.results
          };

          sessionStorage.setItem("testResults", JSON.stringify(testResults));
          navigate("/submit");
        } else {
          setError(data.message || 'Failed to get test results');
        }
      });

      // Emit the test submission event
      socket.emit('submit_test', {
        userId,
        timeTaken
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [selectedAnswers, questions, startTime, navigate, negativeMarking, socket, userId, questionStatuses]);

  useEffect(() => {
    if (!testStarted) return;

    const handlePopState = (_event: PopStateEvent) => {
      const confirmLeave = window.confirm(
        'Are you sure you want to leave the test? Your progress may be lost.'
      );
      
      if (!confirmLeave) {
        navigate(window.location.pathname, { replace: true });
      } else {
        setTestStarted(false);
        return;
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (testStarted) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
        return event.returnValue;
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-medium">
        Loading questions...
      </div>
    )
  }

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
