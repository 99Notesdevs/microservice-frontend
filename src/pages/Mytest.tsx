import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { env } from '../config/env';
import Cookies from 'js-cookie';
import { FiClock, FiBookOpen, FiArrowRight, FiLoader, FiAlertCircle } from 'react-icons/fi';

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
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your Test
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Select a test to review your performance and track your progress.
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-orange-500 mb-4"
            >
              <FiLoader size={40} />
            </motion.div>
            <p className="text-gray-600">Loading your tests...</p>
          </div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        ) : tests.length > 0 ? (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{test.name}</h3>
                      <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Test {index + 1}
                      </div>
                    </div>
                    
                    {test.description && (
                      <p className="text-gray-600 mb-6">{test.description}</p>
                    )}
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <FiBookOpen className="mr-2 text-yellow-500" />
                        <span className="text-sm">{test.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiClock className="mr-2 text-yellow-500" />
                        <span className="text-sm">{test.timeLimit} Minutes Duration</span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleTestClick(test.id)}
                  >
                    <span className="text-sm font-medium text-yellow-600">View Details</span>
                    <FiArrowRight className="text-yellow-500" />
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
            transition={{ duration: 0.5 }}
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests available</h3>
            <p className="text-gray-500 mb-6">You don't have any tests assigned yet. Please check back later.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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