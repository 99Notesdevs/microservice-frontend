// ritik's code // implementation of the Dashboard component with mock data you can uncomment the api part below to take data from backend
import {
  RadarChart, LineChart, Line,PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { env } from '@/config/env';
import Cookies from 'js-cookie';
import RadarChartComponent from '@/components/home/RadarChart';

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
  const mockBarData: TestScore[] = [
    { name: 'Test 1', score1: 400, score2: 300, score3: 200 },
    { name: 'Test 2', score1: 450, score2: 350, score3: 250 },
    { name: 'Test 3', score1: 500, score2: 400, score3: 300 },
    { name: 'Test 4', score1: 550, score2: 450, score3: 350 },
    { name: 'Test 5', score1: 600, score2: 500, score3: 400 },
  ];
  const progressConstraints = {
    weakLimit: 250,
    strongLimit: 450,
    xp_status: [
      {rating: 250, status: "Weak",xp: 100},
      {rating: 300, status: "Strong",xp: 200},
      {rating: 350, status: "Strong",xp: 300},
      {rating: 400, status: "Strong",xp: 400},
      {rating: 450, status: "Strong",xp: 500},
    ]
  }
  const [data, setData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [progressData, setProgressData] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<any>(null);
  const [last5tests, setLast5tests] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(10);
  const [testSeriesData, setTestSeriesData] = useState<TestSeriesData[]>([]);

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
          
          // Process data for radar chart
          const formattedData = result.data.map((item: any) => ({
            subject: item.categoryName || `Category ${item.categoryId}`,
            rating: (item.rating / 100) * 10, // Convert 0-500 to 0-10 scale
            fullMark: 10
          }));
          
          setRadarData(formattedData);
          
          // Set min and max ratings from progressConstraints
          setMinRating((progressConstraints.weakLimit / 100) * 2); // 100 -> 2/10
          setMaxRating((progressConstraints.strongLimit / 100) * 1.8); // 500 -> 9/10 (slightly below max for better visualization)
          
          const categoryMap: Record<number, string> = {};
          result.data.forEach((item: any) => {
            if (item.categoryName && item.categoryId) {
              categoryMap[item.categoryId] = item.categoryName;
            }
          });
          setCategories(categoryMap);
        }
        
        const responseB = await fetch(`${env.API}/progress/${userId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const resultB = await responseB.json();
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
          console.log("resultP.data",resultP.data);
          setUserData(resultP.data);
        } else {
          console.log(resultP.error);
        }
        const responseL = await fetch(`${env.API}/user/testSeries/data`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const resultL = await responseL.json();
        if (resultL.success) {
          console.log("resultL.data",resultL.data);
          setLast5tests(resultL.data);
          setTestSeriesData(resultL.data);
        } else {
          console.log(resultL.error);
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
    const { xp_status } = progressConstraints;
    const currentLevel = [...xp_status].reverse().find(level => rating >= level.rating) || xp_status[0];
    return {
      experience: currentLevel.xp,
      status: currentLevel.status
    };
  };

  const userRating = userData?.userData.rating || 0;
  const { experience, status } = getExperienceAndStatus(userRating);
  const maxRatingLevel = progressConstraints.xp_status[progressConstraints.xp_status.length - 1].rating;
  const progressPercentage = Math.min(100, (userRating / maxRatingLevel) * 100);

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
    <div className="p-4 sm:p-6 bg-gray-200 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Student Stats */}
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-xs sm:text-sm text-gray-700 mb-2">Global Rating — <span className="font-semibold">{userRating}</span></p>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">Experience Level — <span className="font-semibold">{experience} XP</span></p>
            <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">Test Attempted — <span className="font-semibold">{`${stats?.completedCategories || 0}/${stats?.totalCategories || 0}`}</span></p>
            <p className="text-xs sm:text-sm text-gray-700">Status — <span className="font-semibold">{status}</span></p>
          </div>

          <RadarChartComponent />
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Test Series Progress</h2>
            <TestSeriesBarChart data={testSeriesData} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Line Chart */}
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-center font-semibold mb-2">My Rating Progress</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={progressData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis domain={[0, 500]} />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                  formatter={(value, name) => [value, name === 'progressMax' ? 'Max Rating' : 'Min Rating']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progressMax" 
                  stroke="#10b981" 
                  name="Max Rating" 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="progressMin" 
                  stroke="#ef4444" 
                  name="Min Rating" 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-center font-semibold mb-2">Last 5 Prelims Tests Series</p>
            <BarChart width={330} height={200} data={mockBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score1" fill="#f59e0b" />
              <Bar dataKey="score2" fill="#3b82f6" />
              <Bar dataKey="score3" fill="#10b981" />
            </BarChart>
          </div> */}
        </div>
      </div>
    </div>
  );
}