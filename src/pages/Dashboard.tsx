// ritik's code // implementation of the Dashboard component with mock data you can uncomment the api part below to take data from backend
import {
  RadarChart, LineChart, Line,PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { env } from '@/config/env';
import Cookies from 'js-cookie';

interface RatingData {
  categoryId: number;
  rating: number;
  categoryName?: string;
}

interface TestScore {
  name: string;
  score1: number;
  score2: number;
  score3: number;
}

export default function Dashboard() {
  // MOCK DATA USAGE
  const mockBarData: TestScore[] = [
    { name: 'Test 1', score1: 400, score2: 300, score3: 200 },
    { name: 'Test 2', score1: 450, score2: 350, score3: 250 },
    { name: 'Test 3', score1: 500, score2: 400, score3: 300 },
    { name: 'Test 4', score1: 550, score2: 450, score3: 350 },
    { name: 'Test 5', score1: 600, score2: 500, score3: 400 },
  ];
  const mockRatingData: RatingData[] = [
    { categoryId: 1, rating: 420, categoryName: 'Math' },
    { categoryId: 2, rating: 350, categoryName: 'Science' },
    { categoryId: 3, rating: 280, categoryName: 'English' },
    { categoryId: 4, rating: 490, categoryName: 'History' },
    { categoryId: 5, rating: 320, categoryName: 'Geography' },
    { categoryId: 6, rating: 410, categoryName: 'Computer' },
    { categoryId: 7, rating: 390, categoryName: 'Economics' },
    { categoryId: 8, rating: 250, categoryName: 'Arts' },
  ];

  const [data, setData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [progressData, setProgressData] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        // Fetch category ratings
        const response = await fetch(`${env.API}/ratingCategory/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
  
          const categoryMap: Record<number, string> = {};
          result.data.forEach((item: any) => {
            if (item.categoryName && item.categoryId) {
              categoryMap[item.categoryId] = item.categoryName;
            }
          });
          setCategories(categoryMap);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const response = await fetch(`${env.API}/progress/${userId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          // Assuming result.data is an array of progress objects with { date, progressMin, progressMax }
          setProgressData(result.data.map((item: any) => ({
            date: item.date,
            progress: item.progressMax, // or any logic you want
          })));
        } else {
          setProgressError('Failed to fetch progress');
        }
      } catch (err) {
        setProgressError(err);
      } finally {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, []);

  // Use mock data for logic
  // const data = mockRatingData;
  // const barData = mockBarData;
  // const loading = false;
  // const error = null;
  // const categories = mockRatingData.reduce((acc, item) => {
  //   acc[item.categoryId] = item.categoryName || `Category ${item.categoryId}`;
  //   return acc;
  // }, {} as Record<number, string>);

  // Radar chart data
  const radarData = useMemo(() => {
    return data.map(item => ({
      subject: categories[item.categoryId] || `Category ${item.categoryId}`,
      A: item.rating,
      fullMark: 500,
      categoryId: item.categoryId,
    }));
  }, [data, categories]);

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

  if (loading || progressLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error || progressError) return <div className="text-red-500 p-4">Error loading data</div>;
  if (data.length === 0) return <div className="p-4">No rating data available</div>;

  return (
    <div className="p-4 sm:p-6 bg-gray-200 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Student Stats */}
        <div className="bg-white rounded-lg p-4 shadow mb-4 md:mb-0">
          <p className="text-xs sm:text-sm text-gray-700 mb-2">Global Rating — <span className="font-semibold">{stats?.averageRating || 0}</span></p>
          <p className="text-xs sm:text-sm text-gray-700 mb-2">Experience Level — <span className="font-semibold">{stats?.maxRating || 0}</span></p>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.completionPercentage || 0}%` }}></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mb-2">Test Attempted — <span className="font-semibold">{`${stats?.completedCategories}/${stats?.totalCategories}`}</span></p>
          <p className="text-xs sm:text-sm text-gray-700">Status — <span className="font-semibold">Student</span></p>
        </div>

        {/* 2. Radar Chart Section */}
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center w-full overflow-x-auto">
          <div className="w-full flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart outerRadius={60} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 500]} />
                <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Progress Line Graph from backend */}
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-center font-semibold mb-2">My progress</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={progressData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 500]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="progress" stroke="#3b82f6" name="Progress" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}