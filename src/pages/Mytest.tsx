import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { env } from '../config/env';
import Cookies from 'js-cookie';
import { FiClock, FiBookOpen, FiChevronRight, FiBarChart2, FiAlertCircle } from 'react-icons/fi';

interface Test {
  id: string;
  name: string;
  description?: string;
  totalQuestions: number;
  timeLimit: number;
}

const Mytest = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`${env.API}/user/tests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch tests');
        const data = await response.json();
        if (data.success && data.data) {
          setTests(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleTestClick = (testId: string) => {
    navigate(`/review-socket/${testId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
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
            My Tests
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Select a test to review your performance and track your progress.
          </motion.p>
        </motion.div>

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
              <p className="text-gray-500 font-medium">Loading your tests...</p>
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
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : tests.length > 0 ? (
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
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
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
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 cursor-pointer"
                  onClick={() => handleTestClick(test.id)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{test.name}</h3>
                        {test.description && (
                          <p className="text-gray-600 text-sm">{test.description}</p>
                        )}
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Test {index + 1}
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">Questions</p>
                          <p className="text-xl font-bold text-gray-800">
                            {test.totalQuestions}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-600 mb-1">Time Limit</p>
                          <p className="text-xl font-bold text-gray-800">
                            {test.timeLimit} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiBookOpen className="mr-2 text-gray-500" />
                          <span>{test.totalQuestions} Questions</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-gray-500" />
                          <span>{test.timeLimit} min</span>
                        </div>
                      </div>
                      <motion.div 
                        className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm font-medium text-blue-600 flex items-center">
                          <FiBarChart2 className="mr-2" />
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tests available</h3>
            <p className="mt-2 text-sm text-gray-500">You don't have any tests assigned yet. Please check back later.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mt-6"
            >
              Refresh Page
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Mytest;