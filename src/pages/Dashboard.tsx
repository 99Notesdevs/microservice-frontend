// ritik's code // implementation of the Dashboard component with mock data you can uncomment the api part below to take data from backend
import {
  LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { env } from '@/config/env';
import Cookies from 'js-cookie';
import RadarChartComponent from '@/components/home/RadarChart';
import { api } from '@/api/route';
import { motion, AnimatePresence } from 'framer-motion';
import AppTour from '@/components/home/AppTour';

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

interface RadarDataPoint {
  subject: string;
  rating: number;
  fullMark: number;
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
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(10);
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

          // Process data for radar chart with actual category names
          const formattedData = dataWithCategoryNames.map((item: any) => ({
            subject: item.categoryName || `Category ${item.categoryId}`,
            rating: (item.rating / 100) * 10, // Convert 0-500 to 0-10 scale
            fullMark: 10
          }));

          setRadarData(formattedData);

          // Set min and max ratings from progressConstraints
          setMinRating((progressConstraints?.weakLimit || 250 / 100) * 2); // 100 -> 2/10
          setMaxRating((progressConstraints?.strongLimit || 450 / 100) * 1.8); // 500 -> 9/10 (slightly below max for better visualization)

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
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
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

  const nextMessage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % globalMessages.length);
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

  // Reference circles: inner (0-200), outer (100-500)
  const referenceRadarData = useMemo(() => {
    // Use same subjects as userRadarData
    return (userRadarData.length ? userRadarData : radarData).map(item => ({
      subject: item.subject,
      inner: mapRatingToRadar(200), // 200/500*10 = 4
      outer: mapRatingToRadar(500), // 10
    }));
  }, [userRadarData, radarData]);

  if (loading || progressLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error || progressError) return <div className="text-red-500 p-4">Error loading data</div>;
  if (data.length === 0) return <div className="p-4">No rating data available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppTour />
      <div className="global-message">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {globalMessages.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xl md:text-2xl text-gray-800 font-serif italic leading-relaxed">
                  "{globalMessages[currentIndex].content}"
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  — 99Notes
                </p>
              </div>
            ) : (
              <p className="text-gray-400 italic">No messages available</p>
            )}
          </motion.div>
        </AnimatePresence>
        {globalMessages.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            {globalMessages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-gray-800' : 'bg-gray-200'
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="stats-box grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Global Rating", 
              value: userRating,
              icon: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            },
            { 
              label: "Experience Level", 
              value: experience,
              icon: <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            },
            { 
              label: "Tests Attempted", 
              value: `${stats?.completedCategories || 0}`,
              icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            },
            { 
              label: "Status", 
              value: status,
              icon: <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-opacity-20 bg-blue-100">
                  {item.icon}
                </div>
                <span className="text-gray-600">{item.label}</span>
              </div>
              <span className="text-gray-900 font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="radar-chart-container bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <RadarChartComponent
              userRadarData={userRadarData}
              referenceRadarData={referenceRadarData}
              minRating={minRating}
              maxRating={maxRating}
              strengths={strengths}
              weakness={weakness}
            />
          </div>
          
          <div className="test-series-chart bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Test Series Performance</h3>
            <TestSeriesBarChart data={testSeriesData} />
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-chart bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
          {progressData.length > 0 && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                    tick={{fill: '#6b7280', fontSize: 12}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 500]} 
                    tick={{fill: '#6b7280', fontSize: 12}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`} 
                    formatter={(value, name) => [value, name === 'progressMax' ? 'Max Rating' : 'Min Rating']} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progressMax" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                    name="Max Rating" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progressMin" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
                    name="Min Rating" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Rating Messages */}
        <div className="rating-message bg-white p-6 rounded-lg shadow">
          {userData?.userData?.rating && (
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-600">Progress Insight</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  Rating: {userData.userData.rating}
                </span>
              </div>
              <AnimatePresence mode="wait">
                {ratingMessages.length > 0 ? (
                  <motion.div
                    key={`rating-${currentRatingIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-base text-gray-700 leading-relaxed"
                  >
                    {ratingMessages[currentRatingIndex]?.content}
                  </motion.div>
                ) : (
                  <p className="text-gray-400 text-center">No insights available</p>
                )}
              </AnimatePresence>
              {ratingMessages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {ratingMessages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentRatingIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentRatingIndex ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                      aria-label={`Go to insight ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}