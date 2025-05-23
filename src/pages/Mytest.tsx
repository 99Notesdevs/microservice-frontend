import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { env } from '../config/env';
import Cookies from 'js-cookie';

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
    <div className="p-8 sm:p-12 bg-gradient-to-b from-orange-50 to-orange-100 min-h-screen flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-2xl border border-orange-100"
      >
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold mb-6 text-orange-700 text-center tracking-tight"
        >
          Your Tests
        </motion.h1>
        
        {loading && (
          <div className="text-center py-4">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-gray-500"
            >
              Loading tests...
            </motion.div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        )}

        {tests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {tests.map((test) => (
              <motion.div
                key={test.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-orange-50 p-4 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => handleTestClick(test.id)}
              >
                <h3 className="text-lg font-semibold text-orange-700">{test.name}</h3>
                {test.description && <p className="text-gray-600 mt-1">{test.description}</p>}
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>{test.totalQuestions} Questions</span>
                  <span>{test.timeLimit} Minutes</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Mytest;