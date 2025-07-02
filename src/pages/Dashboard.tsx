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
    xp_status: Array<{rating: number; status: string; xp: number}>;
  } | null>(null);
  // const [constraintsLoading, setConstraintsLoading] = useState(true);

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
            {rating: 250, status: "Weak", xp: 100},
            {rating: 300, status: "Strong", xp: 200},
            {rating: 350, status: "Strong", xp: 300},
            {rating: 400, status: "Strong", xp: 400},
            {rating: 450, status: "Strong", xp: 500},
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
          setData(typedResponse.data);
          
          // Process data for radar chart
          const formattedData = typedResponse.data.map((item: any) => ({
            subject: item.categoryName || `Category ${item.categoryId}`,
            rating: (item.rating / 100) * 10, // Convert 0-500 to 0-10 scale
            fullMark: 10
          }));
          
          setRadarData(formattedData);
          
          // Set min and max ratings from progressConstraints
          setMinRating((progressConstraints?.weakLimit || 250 / 100) * 2); // 100 -> 2/10
          setMaxRating((progressConstraints?.strongLimit || 450 / 100) * 1.8); // 500 -> 9/10 (slightly below max for better visualization)
          
          const categoryMap: Record<number, string> = {};
          typedResponse.data.forEach((item: any) => {
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
          console.log("resultP.data",resultP.data);
          setUserData(resultP.data);
        } else {
          console.log(resultP.error);
        }
        const responseL = await api.get(`/user/testSeries/data`);
        const resultL = responseL as { success: boolean; data: any };
        if (resultL.success) {
          console.log("resultL.data",resultL.data);
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
        {rating: 250, status: "Weak",xp: 100},
        {rating: 300, status: "Strong",xp: 200},
        {rating: 350, status: "Strong",xp: 300},
        {rating: 400, status: "Strong",xp: 400},
        {rating: 450, status: "Strong",xp: 500},
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
  const maxRatingLevel = (progressConstraints?.xp_status[progressConstraints?.xp_status.length - 1].rating) || 450;
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
    <div className="p-4 sm:p-6 bg-gradient from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Student Stats */}
          <div className="bg-gray-50 rounded-xl p-4 shadow flex flex-col gap-2">
            <div className="grid grid-cols-3 items-center py-1">
              <span className="col-span-1 text-gray-500 text-sm">Global Rating</span>
              <span className="col-span-1 text-center text-gray-400">—</span>
              <span className="col-span-1 text-right text-gray-800 font-semibold">{userRating}</span>
            </div>
            <div className="grid grid-cols-3 items-center py-1">
              <span className="col-span-1 text-gray-500 text-sm">Experience Level</span>
              <span className="col-span-1 text-center text-gray-400">—</span>
              <span className="col-span-1 flex items-center justify-end gap-2">
                <span className="text-gray-800 font-semibold text-base">{experience}</span>
                <div className="relative w-24 h-3 bg-gray-200 rounded-full mx-2">
                  <div
                    className="absolute left-0 top-0 h-3 bg-green-500 rounded-full"
                    style={{ width: `${progressPercentage}%`, minWidth: '0.5rem' }}
                  ></div>
                </div>
                <span className="text-gray-400 text-xs font-semibold">{progressConstraints?.xp_status[progressConstraints?.xp_status.length-1].xp}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center py-1">
              <span className="col-span-1 text-gray-500 text-sm">Test Attempted</span>
              <span className="col-span-1 text-center text-gray-400">—</span>
              <span className="col-span-1 text-right text-gray-800 font-semibold">{`${stats?.completedCategories || 0}`}</span>
            </div>
            <div className="grid grid-cols-3 items-center py-1">
              <span className="col-span-1 text-gray-500 text-sm">Status</span>
              <span className="col-span-1 text-center text-gray-400">—</span>
              <span className="col-span-1 text-right text-gray-800 font-semibold">{status}</span>
            </div>
          </div>

          <RadarChartComponent 
            userRadarData={userRadarData}
            referenceRadarData={referenceRadarData}
            minRating={minRating}
            maxRating={maxRating}
            strengths={strengths}
            weakness={weakness}
          />
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

            <p className="text-center font-semibold mb-2">My Progress</p>
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
        </div>
      </div>
    </div>
  );
}