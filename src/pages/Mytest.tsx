import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiChevronRight, FiBarChart2, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { env } from '../config/env';
import Cookies from 'js-cookie';

interface TestAttempt {
  id: string;
  userId: number;
  questionIds: number[];
  response: string;
  result: string;
  createdAt: string;
  updatedAt: string;
  parsedResult?: {
    score: number;
    totalQuestions: number;
    negativeMarking: boolean;
    timeTaken: number;
    answers: Record<string, string[]>;
    correctAnswers: Record<string, string[]>;
    status: string;
    userId: number;
    result: string;
  };
  parsedResponse?: any;
  score?: number;
  totalQuestions?: number;
  timeTaken?: number;
  status?: string;
  isPassing?: boolean;
  error?: string;
}

const Mytest = () => {
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestAttempts = async () => {
      try {
        const response = await fetch(`${env.API}/user/tests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch test attempts');
        }

        const { data } = await response.json();
        
        // Parse the nested JSON strings in the response
        const parsedAttempts = data.map((attempt: any) => {
          try {
            // Parse the result field which contains the test details
            const parsedResult = JSON.parse(attempt.result);
            // The parsedResult itself might contain another stringified result, so parse that too if needed
            const finalResult = typeof parsedResult === 'string' ? JSON.parse(parsedResult) : parsedResult;
            
            // Parse the response field which contains user's answers
            let parsedResponse = {};
            try {
              const tempResponse = JSON.parse(attempt.response);
              parsedResponse = typeof tempResponse === 'string' ? JSON.parse(tempResponse) : tempResponse;
            } catch (e) {
              console.error('Error parsing response:', e);
            }
            console.log("finalResult",finalResult);
            console.log("parsedResponse",JSON.parse(finalResult.result).timeTaken);
            return {
              ...attempt,
              parsedResult: finalResult,
              parsedResponse,
              // Add any additional derived fields you might need
              score: JSON.parse(finalResult.result).score,
              totalQuestions: JSON.parse(finalResult.result).totalQuestions,
              timeTaken: JSON.parse(finalResult.result).timeTaken,
              status: JSON.parse(finalResult.result).status,
              isPassing: (JSON.parse(finalResult.result).score / (JSON.parse(finalResult.result).totalQuestions * 2)) * 100 >= 50
            };
          } catch (e) {
            console.error('Error parsing attempt:', e, attempt);
            return {
              ...attempt,
              error: 'Failed to parse attempt data',
              parsedResult: {},
              parsedResponse: {}
            };
          }
        });

        setTestAttempts(parsedAttempts);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch test attempts');
      } finally {
        setLoading(false);
      }
    };

    fetchTestAttempts();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScorePercentage = (attempt: TestAttempt) => {
    if (!attempt.parsedResult) return 0;
    return Math.round((JSON.parse(attempt.parsedResult.result).score / (JSON.parse(attempt.parsedResult.result).totalQuestions * 2)) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiAlertCircle className="mr-1" /> {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            My Test Attempts
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Review your test history and track your progress
          </motion.p>
        </motion.div>

        <div className="space-y-6">
          {testAttempts.length === 0 ? (
            <motion.div 
              className="text-center py-16 bg-white rounded-xl shadow-sm px-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50">
                <FiBarChart2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No test attempts found</h3>
              <p className="mt-2 text-sm text-gray-500">You haven't taken any tests yet. Start practicing now!</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {testAttempts.map((attempt, index) => {
                const scorePercentage = getScorePercentage(attempt);
                const isPassing = scorePercentage >= 50;
                
                return (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Test Attempt #{attempt.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(attempt.createdAt)}
                          </p>
                        </div>
                        {attempt.parsedResult?.status && getStatusBadge(attempt.parsedResult.status)}
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-3 rounded-lg ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="text-xs text-gray-600 mb-1">Score</p>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-gray-900 mr-2">
                                {scorePercentage}%
                              </span>
                              {isPassing ? (
                                <FiCheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <FiXCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <p className="text-xs mt-1 text-gray-500">
                              {JSON.parse(attempt?.parsedResult?.result || '').score} / {JSON.parse(attempt?.parsedResult?.result || '').totalQuestions * 2} points
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Time Taken</p>
                            <p className="text-xl font-bold text-gray-800">
                              {attempt.parsedResult ? formatTime(JSON.parse(attempt.parsedResult.result).timeTaken) : 'N/A'}
                            </p>
                            <p className="text-xs mt-1 text-gray-500">
                              Completed on {new Date(attempt.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <FiBookOpen className="mr-2 text-gray-500" />
                            <span>{attempt.parsedResult?.totalQuestions || 0} Questions</span>
                          </div>
                          <motion.button
                            whileHover={{ x: 5 }}
                            className="text-sm font-medium text-blue-600 flex items-center"
                            onClick={() => navigate(`/review-socket/${attempt.id}`)}
                          >
                            Review Details
                            <FiChevronRight className="ml-1" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mytest;