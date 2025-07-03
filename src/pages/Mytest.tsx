import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiBookOpen, FiChevronRight, FiBarChart2, FiEye, FiAlertCircle } from 'react-icons/fi';
import { api } from '@/api/route';

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
        const response = await api.get(`/user/tests`);
        const typedresponse = response as { success: boolean; data: any };
        if (!typedresponse.success) {
          throw new Error("Failed to fetch test attempts")
        }

        const responseData = typedresponse.data;
        
        // Parse the nested JSON strings in the response
        const parsedAttempts = responseData.map((attempt: any) => {
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="w-full mx-auto">
        <motion.p 
          className="text-gray-600 text-lg text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Review your test history and track your progress
        </motion.p>

        {testAttempts.length === 0 ? (
          <motion.div 
            className="text-center py-20 bg-white rounded-2xl shadow-sm px-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50">
              <FiBarChart2 className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No test attempts found</h3>
            <p className="mt-2 text-gray-500">You haven't taken any tests yet.</p>
            <button 
              onClick={() => navigate('/test-selection')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Start Practicing Now
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <AnimatePresence>
              {testAttempts.map((attempt) => {
                const scorePercentage = getScorePercentage(attempt);

                const scoreData = attempt.parsedResult ? JSON.parse(attempt.parsedResult.result || '{}') : {};
                
                return (
                  <motion.div
                    key={attempt.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { 
                        opacity: 1, 
                        y: 0,
                        transition: { 
                          type: 'spring',
                          stiffness: 100,
                          damping: 15
                        }
                      }
                    }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Test #{String(attempt.id).slice(0, 6)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(attempt.createdAt)}
                          </p>
                        </div>
                        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeStyle('Completed')}`}>
                          Completed
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Score</p>
                            <p className="text-xl font-bold text-gray-800">
                              {scoreData.score || 0}/{scoreData.totalQuestions * 2 || 0}
                            </p>
                            <div className="h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${scorePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600 mb-1">Correct</p>
                            <p className="text-xl font-bold text-gray-800">
                              {Math.round((scoreData.score || 0) / 2)}
                              <span className="text-xs font-normal text-gray-500 ml-1">answers</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <FiBookOpen className="mr-2 text-gray-500" />
                            <span>{scoreData.totalQuestions || 0} Questions</span>
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-2 text-gray-500" />
                            <span>{scoreData.timeTaken ? formatTime(scoreData.timeTaken) : 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Attempted on: {formatDate(attempt.createdAt)}
                        </div>
                        
                        <motion.div 
                          className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-sm font-medium text-blue-600 flex items-center"
                                onClick={() => navigate(`/review-socket/${attempt.id}`)}>
                            <FiEye className="mr-2" />
                            Review Test
                          </span>
                          <FiChevronRight className="text-gray-500" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Mytest;