import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiBookOpen, FiChevronRight, FiBarChart2, FiEye } from 'react-icons/fi';
import { api } from '@/api/route';

interface TestSeries {
  id: string;
  name: string;
  description?: string;
  totalTests: number;
  totalQuestions: number;
  timeLimit: number;
  score?: number;
  totalMarks: number;
  attemptedOn?: string;
  status: 'completed' | 'in-progress' | 'not-attempted';
  correctAnswers?: number;
  wrongAnswers?: number;
  skipped?: number;
}

const MytestSeries = () => {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const navigate = useNavigate();

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate performance percentage
  const calculatePerformance = (series: TestSeries) => {
    if (!series.score || !series.totalMarks) return 0;
    return Math.round((series.score / series.totalMarks) * 100);
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchTestSeries = async () => {
      try {
        console.log('Fetching test series data...');
        const response = await api.get(`/user/testSeries`);
        const typedResponse = response as { success: boolean; data: any };
        if (!typedResponse.success) {
          throw new Error("Failed to fetch review data")
        }
        const responseData = typedResponse.data
        console.log('API Response:', responseData);
        
        if (responseData) {
          // Transform the data to match our TestSeries interface
          const transformedData = responseData.map((item: any) => {
            try {
              // Initialize with default values
              let responseData = { response: '[]' };
              let resultData = { score: 0 };
              let responses = [];
              
              // Safely parse response and result
              try {
                if (typeof item.response === 'string') {
                  responseData = JSON.parse(item.response);
                }
                if (typeof item.result === 'string') {
                  resultData = JSON.parse(item.result);
                }
              } catch (e) {
                console.warn('Error parsing JSON:', e);
              }
          
              // Parse responses if they exist
              if (responseData?.response && typeof responseData.response === 'string') {
                try {
                  responses = JSON.parse(responseData.response);
                } catch (e) {
                  console.warn('Error parsing responses:', e);
                }
              }
          
              // Calculate metrics with null checks
              let correctAnswers = 0;
              let wrongAnswers = 0;
              let skipped = 0;
          
              if (Array.isArray(responses)) {
                responses.forEach((r) => {
                  if (r && typeof r === 'object') {
                    if (Array.isArray(r.selectedOptions) && r.selectedOptions.length > 0) {
                      r.isCorrect ? correctAnswers++ : wrongAnswers++;
                    } else {
                      skipped++;
                    }
                  }
                });
              }
          
              // Calculate score safely
              const score = typeof resultData.score === 'number' ? resultData.score : correctAnswers;
              const totalQuestions = Array.isArray(responses) ? responses.length : 0;
          
              return {
                id: item.id?.toString() || '0',
                name: item.test.name || `Test Series ${item.testId || '0'}`,
                totalTests: 1,
                totalQuestions,
                timeLimit: 30, // Default value
                score,
                totalMarks: totalQuestions, // 1 mark per question
                attemptedOn: item.createdAt || new Date().toISOString(),
                status: 'completed',
                correctAnswers,
                wrongAnswers,
                skipped
              };
            } catch (error) {
              console.error('Error processing test series item:', error, item);
              return {
                id: '0',
                name: 'Test Series',
                totalTests: 1,
                totalQuestions: 0,
                timeLimit: 30,
                score: 0,
                totalMarks: 0,
                attemptedOn: new Date().toISOString(),
                status: 'not-attempted',
                correctAnswers: 0,
                wrongAnswers: 0,
                skipped: 0
              };
            }
          });
          console.log('Transformed Data:', transformedData);
          setTestSeries(transformedData);
        } else {
          console.warn('No data received from API');
          setTestSeries([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch test series';
        console.error('Error fetching test series:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, []);

  const handleTestSeriesClick = (seriesId: string) => {
    navigate(`/review/${seriesId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Review your completed tests and analyze your performance
          </motion.p>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <motion.div 
              className="flex flex-col items-center"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4"></div>
              <p className="text-gray-500 font-medium">Loading your test series...</p>
            </motion.div>
          </div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : testSeries.length > 0 ? (
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
              {testSeries.map((series) => (
                <motion.div
                  key={series.id}
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
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 ${
                    selectedSeries === series.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onMouseEnter={() => setSelectedSeries(series.id)}
                  onMouseLeave={() => setSelectedSeries(null)}
                  onClick={() => handleTestSeriesClick(series.id)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{series.name}</h3>
                        {series.description && (
                          <p className="text-gray-600 text-sm">{series.description}</p>
                        )}
                      </div>
                      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeStyle(series.status)}`}>
                        {series.status === 'completed' ? 'Completed' : series.status === 'in-progress' ? 'In Progress' : 'Not Attempted'}
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">Score</p>
                          <p className="text-xl font-bold text-gray-800">
                            {series.score !== undefined ? `${series.score}/${series.totalMarks}` : '--/--'}
                          </p>
                          <div className="h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${calculatePerformance(series)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-600 mb-1">Correct</p>
                          <p className="text-xl font-bold text-gray-800">
                            {series.correctAnswers || 0}
                            <span className="text-xs font-normal text-gray-500 ml-1">answers</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiBookOpen className="mr-2 text-gray-500" />
                          <span>{series.totalQuestions} Questions</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-gray-500" />
                          <span>{series.timeLimit} min</span>
                        </div>
                      </div>
                      
                      {series.attemptedOn && (
                        <div className="text-xs text-gray-500">
                          Attempted on: {formatDate(series.attemptedOn)}
                        </div>
                      )}
                      
                      <motion.div 
                        className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm font-medium text-blue-600 flex items-center">
                          <FiEye className="mr-2" />
                          Review Test
                        </span>
                        <FiChevronRight className="text-gray-500" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16 bg-white rounded-xl shadow-sm px-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50">
              <FiBarChart2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No test attempts found</h3>
            <p className="mt-2 text-sm text-gray-500">You haven't attempted any tests yet. Complete a test to review your performance here.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MytestSeries;