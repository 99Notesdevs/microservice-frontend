// ritik's code // implementation of the Dashboard component with mock data you can uncomment the api part below to take data from backend
import {
  LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { env } from '@/config/env';
import RadarChartComponent from '@/components/home/RadarChart';
import { api } from '@/api/route';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingData {
  categoryId: number;
  rating: number;
  categoryName?: string;
}

interface TestSeriesData {
  name: string;
  score: number;
  averageScore: number;
  bestScore: number;
}


interface TestSeriesData {
  testId: number;
  score: number;
  averageScore: number;
  bestScore: number;
}

interface Message {
  id: number;
  type: 'global' | 'range';
  content: string;
  ratingS?: number;
  ratingE?: number;
  createdAt: string;
  updatedAt: string;
}

const TestSeriesBarChart = ({ data }: { data: TestSeriesData[] }) => {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: `Test ${index + 1}`,
      score: item.score,
      average: item.averageScore,
      best: item.bestScore
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" name="Your Score" fill="#8884d8" />
        <Bar dataKey="average" name="Average Score" fill="#82ca9d" />
        <Bar dataKey="best" name="Best Score" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function Dashboard() {
  // MOCK DATA USAGE
  const [data, setData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [testSeriesData, setTestSeriesData] = useState<TestSeriesData[]>([]);
  const [progressConstraints, setProgressConstraints] = useState<{
    weakLimit: number;
    strongLimit: number;
    xp_status: Array<{ rating: number; status: string; xp: number }>;
  } | null>(null);
  // const [constraintsLoading, setConstraintsLoading] = useState(true);

  const [globalMessages, setGlobalMessages] = useState<Message[]>([]);
  const [ratingMessages, setRatingMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);
  const [ratingDirection, setRatingDirection] = useState(0);

  useEffect(() => {
    const fetchProgressConstraints = async () => {
      try {
        // const response = await fetch(`${env.API}/progressConstraints`, {
        //   headers: {
        //     'Authorization': `Bearer ${Cookies.get('token')}`,
        //     'Content-Type': 'application/json',
        //   },
        // });
        const data = await api.get('/progressConstraints');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch progress constraints');
        // }

        // const data = await response.json();
        const typedData = data as { data: { xp_status: string; weakLimit: number; strongLimit: number } };
        const xpStatus = typeof typedData.data.xp_status === 'string'
          ? JSON.parse(typedData.data.xp_status)
          : typedData.data.xp_status;

        setProgressConstraints({
          weakLimit: typedData.data.weakLimit,
          strongLimit: typedData.data.strongLimit,
          xp_status: xpStatus
        });
      } catch (error) {
        console.error('Error fetching progress constraints:', error);
        // Set default values if API fails
        setProgressConstraints({
          weakLimit: 250,
          strongLimit: 450,
          xp_status: [
            { rating: 250, status: "Weak", xp: 100 },
            { rating: 300, status: "Strong", xp: 200 },
            { rating: 350, status: "Strong", xp: 300 },
            { rating: 400, status: "Strong", xp: 400 },
            { rating: 450, status: "Strong", xp: 500 },
          ]
        });
      } finally {
        // setConstraintsLoading(false);
      }
    };

    fetchProgressConstraints();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        // Fetch category ratings
        const response = await api.get(`/ratingCategory/user/${userId}`);
        const typedResponse = response as { success: boolean; data: any };
        if (typedResponse.success) {
          const dataWithCategoryNames = await Promise.all(typedResponse.data.map(async (item: any) => {
            try {
              const categoryResponse = await api.get(`/categories/${item.categoryId}`);
              const typedCategoryResponse = categoryResponse as { success: boolean; data: any };
              if (typedCategoryResponse.success) {
                return {
                  ...item,
                  categoryName: typedCategoryResponse.data.name
                };
              }
            } catch (error) {
              console.error(`Error fetching category ${item.categoryId}:`, error);
              return {
                ...item,
                categoryName: item.categoryName
              };
            }
          }));

          // Update the data state with category names
          setData(dataWithCategoryNames);


          const categoryMap: Record<number, string> = {};
          dataWithCategoryNames.forEach((item: any) => {
            if (item.categoryName && item.categoryId) {
              categoryMap[item.categoryId] = item.categoryName;
            }
          });
          // setCategories(categoryMap);
        }

        const responseB = await api.get(`/progress/${userId}`);
        const resultB = responseB as { success: boolean; data: any };
        if (resultB.success) {
          // Parse dates and ensure numbers for the chart
          const formattedData = resultB.data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString(),
            progressMax: Number(item.progressMax),
            progressMin: Number(item.progressMin),
          }));

          // Sort by date to ensure chronological order
          formattedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setProgressData(formattedData);
        } else {
          setProgressError('Failed to fetch progress');
        }
        const responseP = await fetch(`${env.API_MAIN}/user`, {
          credentials: "include",
        });
        const resultP = await responseP.json();
        if (resultP.success) {
          // Assuming result.data is an array of progress objects with { date, progressMin, progressMax }
          console.log("resultP.data", resultP.data);
          setUserData(resultP.data);
        } else {
          console.log(resultP.error);
        }
        const responseL = await api.get(`/user/testSeries/data`);
        const resultL = responseL as { success: boolean; data: any };
        if (resultL.success) {
          console.log("resultL.data", resultL.data);
          // setLast5tests(resultL.data);
          setTestSeriesData(resultL.data);
        } else {
          setError('Failed to fetch last 5 tests');
        }
      } catch (err) {
        setProgressError(err);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch global messages
        const globalResponse = await api.get('/admin-messages/global');
        const globalTypedResponse = globalResponse as { success: boolean; data: any };
        if (globalTypedResponse.success) {
          setGlobalMessages(globalTypedResponse.data || []);
        }

        // Fetch rating-specific messages if user has a rating
        if (userData?.userData?.rating) {
          const ratingResponse = await api.get(`/admin-messages/rating/${userData.userData.rating}`);
          const ratingTypedResponse = ratingResponse as { success: boolean; data: any };
          if (ratingTypedResponse.success) {
            setRatingMessages(ratingTypedResponse.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Set up interval to cycle through messages
    const globalInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % globalMessages.length);
    }, 5000);
    const ratingInterval = setInterval(() => {
      setCurrentRatingIndex(prev => (prev + 1) % ratingMessages.length);
    }, 5000);

    return () => {
      clearInterval(globalInterval);
      clearInterval(ratingInterval);
    };
  }, [userData, globalMessages.length, ratingMessages.length]);

  const messageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      position: 'absolute' as const,
    }),
  };

  const prevMessage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + globalMessages.length) % globalMessages.length);
  };

  const nextRatingMessage = () => {
    setRatingDirection(1);
    setCurrentRatingIndex((prev) => (prev + 1) % ratingMessages.length);
  };

  const prevRatingMessage = () => {
    setRatingDirection(-1);
    setCurrentRatingIndex((prev) => (prev - 1 + ratingMessages.length) % ratingMessages.length);
  };

  const AnimatedMessage = ({ message, title }: { message: string; title: string }) => (
    <motion.div
      key={message}
      custom={direction}
      variants={messageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full h-full flex items-center justify-center absolute inset-0"
    >
      <div className="px-4">
        <div className="text-sm font-semibold text-gray-500 mb-2">{title}</div>
        <div className="text-gray-700">{message}</div>
      </div>
    </motion.div>
  );

  const messageBoxStyle = "bg-white p-6 rounded-xl shadow-lg mb-6 relative overflow-hidden min-h-[120px] flex items-center";

  // Stats
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = Math.round(totalRating / data.length);
    const maxRating = Math.max(...data.map(item => item.rating));
    const minRating = Math.min(...data.map(item => item.rating));
    const completedCategories = data.length;
    const totalCategories = 8;
    return {
      averageRating,
      maxRating,
      minRating,
      completionPercentage: Math.round((completedCategories / totalCategories) * 100),
      totalCategories,
      completedCategories,
    };
  }, [data]);

  const getExperienceAndStatus = (rating: number) => {
    const { xp_status } = progressConstraints || {
      weakLimit: 250,
      strongLimit: 450,
      xp_status: [
        { rating: 250, status: "Weak", xp: 100 },
        { rating: 300, status: "Strong", xp: 200 },
        { rating: 350, status: "Strong", xp: 300 },
        { rating: 400, status: "Strong", xp: 400 },
        { rating: 450, status: "Strong", xp: 500 },
      ]
    };
    const currentLevel = [...xp_status].reverse().find(level => rating >= level.rating) || xp_status[0];
    return {
      experience: currentLevel.xp,
      status: currentLevel.status
    };
  };

  const userRating = userData?.userData.rating || 0;
  const { experience, status } = getExperienceAndStatus(userRating);

  // Helper: Map rating (0-500) to radar chart value (0-10)
  const mapRatingToRadar = (rating: number) => (rating / 500) * 10;

  // Helper: Find strengths (top 3) and weakness (lowest 1)
  const strengths = useMemo(() => {
    if (!data.length) return [];
    const sorted = [...data].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, 3).map(d => d.categoryName || `Category ${d.categoryId}`);
  }, [data]);
  const weakness = useMemo(() => {
    if (!data.length) return [];
    const sorted = [...data].sort((a, b) => a.rating - b.rating);
    return sorted.slice(0, 1).map(d => d.categoryName || `Category ${d.categoryId}`);
  }, [data]);

  // Radar chart data for user polygon
  const userRadarData = useMemo(() => {
    return data.map(item => ({
      subject: item.categoryName || `Category ${item.categoryId}`,
      value: mapRatingToRadar(item.rating),
      raw: item.rating,
    }));
  }, [data]);


  if (loading || progressLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error || progressError) return <div className="text-red-500 p-4">Error loading data</div>;
  if (data.length === 0) return <div className="p-4">No rating data available</div>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <div className="md:col-span-2">
          <div className={`${messageBoxStyle} relative w-full global-message`}>
            <button onClick={prevMessage} className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 text-gray-500 hover:text-gray-700" aria-label="Previous message">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-full relative h-full">
              <AnimatePresence mode="wait" custom={direction}>
                {globalMessages.length > 0 ? (
                  <AnimatedMessage message={globalMessages[currentIndex].content} title="Global Message" />
                ) : (
                  <div className="text-center w-full">No global messages available</div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats and Rating Column */}
        <div className="space-y-4">
          {/* Stats Box */}
          <div className="bg-white rounded-xl p-4 shadow space-y-2 stats-box">
            {[
              { label: "Global Rating", value: userRating },
              { label: "Experience Level", value: experience },
              { label: "Test Attempted", value: `${stats?.completedCategories || 0}` },
              { label: "Status", value: status }
            ].map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 items-center text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-center text-gray-400">—</span>
                <span className="text-right text-gray-800 font-semibold flex items-center justify-end gap-2">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Message for Rating */}
          {userData?.userData?.rating && (
            <div className="bg-white p-4 rounded-xl shadow relative overflow-hidden min-h-[120px] flex items-center rating-message">
              <button onClick={prevRatingMessage} className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 text-gray-500 hover:text-gray-700" aria-label="Previous rating message">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="w-full relative h-full">
                <AnimatePresence mode="wait" custom={ratingDirection}>
                  {ratingMessages.length > 0 ? (
                    <motion.div
                      key={`rating-${currentRatingIndex}`}
                      custom={ratingDirection}
                      variants={messageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                      className="w-full h-full flex items-center justify-center absolute inset-0 px-2 text-center"
                    >
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Message for Rating: {userData.userData.rating}</div>
                        <div className="text-gray-700 text-sm">{ratingMessages[currentRatingIndex]?.content}</div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center w-full text-sm">No messages available for your rating</div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={nextRatingMessage} className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-1 text-gray-500 hover:text-gray-700" aria-label="Next rating message">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-4 shadow radar-chart-container h-full">
            <RadarChartComponent
              userRadarData={userRadarData}
              strengths={strengths}
              weakness={weakness}
            />
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Series Chart */}
        {testSeriesData.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow test-series-chart">
            <h3 className="text-lg font-semibold mb-4">Test Series Performance</h3>
            <TestSeriesBarChart data={testSeriesData} />
          </div>
        )}

        {/* Progress Chart */}
        {progressData.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow progress-chart">
            <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis domain={[0, 500]} />
                <Tooltip labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`} formatter={(value, name) => [value, name === 'progressMax' ? 'Max Rating' : 'Min Rating']} />
                <Legend />
                <Line type="monotone" dataKey="progressMax" stroke="#10b981" name="Max Rating" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="progressMin" stroke="#ef4444" name="Min Rating" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}