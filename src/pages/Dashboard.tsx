import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { env } from '@/config/env';
import Cookies from 'js-cookie';
import { useEffect, useState, useMemo } from 'react';

interface RatingData {
  categoryId: number;
  rating: number;
  categoryName?: string; 
}

export default function Dashboard() {
  const [data, setData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [categories, setCategories] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
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

  const radarData = useMemo(() => {
    return data.map(item => ({
      subject: categories[item.categoryId] || `Category ${item.categoryId}`,
      rating: item.rating,
      fullMark: 500, 
      categoryId: item.categoryId, 
    }));
  }, [data, categories]);

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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading data</div>;
  if (data.length === 0) return <div className="p-4">No rating data available</div>;

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Performance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
          <p className="text-2xl font-bold">{stats?.averageRating || 0}</p>
          <p className="text-xs text-gray-500">out of 500</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500 text-sm font-medium">Highest Rated</h3>
          <p className="text-xl font-bold">{stats?.maxRating || 0}</p>
          <p className="text-xs text-gray-500">top category</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500 text-sm font-medium">Categories Completed</h3>
          <p className="text-2xl font-bold">{`${stats?.completedCategories}/${stats?.totalCategories}`}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${stats?.completionPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500 text-sm font-medium">Performance</h3>
          <p className="text-2xl font-bold">
            {stats?.averageRating && stats.averageRating > 300 ? 'Good' : 'Needs Improvement'}
          </p>
          <p className="text-xs text-gray-500">
            {stats?.averageRating && stats.averageRating > 300 ? 'Keep it up!' : 'Focus on weak areas'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Category-wise Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 500]} />
                <Radar
                  name="Your Rating"
                  dataKey="rating"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Category Ratings</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...radarData].sort((a, b) => b.rating - a.rating)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 500]} />
                <YAxis dataKey="subject" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" fill="#3b82f6" name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Detailed Category Analysis</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {radarData.map((item) => (
                <tr key={item.subject}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.rating}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.rating > 400 ? 'bg-green-100 text-green-800' : 
                      item.rating > 300 ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.rating > 400 ? 'Excellent' : item.rating > 300 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.rating / 500) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round((item.rating / 500) * 100)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
