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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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

  // Sort test attempts by date (newest first)
  const sortedTestAttempts = [...testAttempts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get current tests
  const indexOfLastTest = currentPage * itemsPerPage;
  const indexOfFirstTest = indexOfLastTest - itemsPerPage;
  const currentTests = sortedTestAttempts.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(testAttempts.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
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
        <motion.div className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            My Test Attempts
          </motion.h1>
          {testAttempts.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstTest + 1}-{Math.min(indexOfLastTest, testAttempts.length)} of {testAttempts.length} tests
            </div>
          )}
        </motion.div>

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
          <>
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
                {currentTests.map((attempt) => {
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

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex-1 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show first, last, current, and adjacent pages
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
                <div className="hidden sm:block">
                  <div className="relative">
                    <select
                      value={itemsPerPage}
                      disabled
                      className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Mytest;