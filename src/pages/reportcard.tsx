"use client";
import { env } from '@/config/env';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryRating {
  _id: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  rating: number;
  totalQuestions: number;
  correctAnswers: number;
  lastUpdated: string;
}

export default function ReportCard() {
  const { user } = useAuth();
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryRatings = async () => {
      try {
        console.log('Fetching category ratings for user:', user?.id);
        const response = await axios.get(`${env.API}/ratingCategory/user/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('API Response:', response.data);
        
        // Ensure we have an array before setting state
        if (Array.isArray(response.data)) {
          setCategoryRatings(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // If the response is an object, try to extract an array from it
          const data = response.data.data || response.data.ratings || [];
          setCategoryRatings(Array.isArray(data) ? data : []);
        } else {
          console.error('Unexpected API response format:', response.data);
          setError('Received unexpected data format from server');
          setCategoryRatings([]);
        }
      } catch (err) {
        console.error('Error fetching test series data:', err);
        setError('Failed to load test series data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCategoryRatings();
    }
  }, [user]);

  // Prepare data for the bar chart
  // Ensure we have valid data before rendering the chart
  const chartData = {
    labels: Array.isArray(categoryRatings) 
      ? categoryRatings.map(cat => cat?.categoryName || `Category ${cat?.categoryId || 'N/A'}`)
      : [],
    datasets: [
      {
        label: 'Category Rating (out of 500)',
        data: Array.isArray(categoryRatings) 
          ? categoryRatings.map(cat => cat?.rating || 0) 
          : [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your Test Series Ratings',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Report Card</h1>
      
      {categoryRatings.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Category Performance Overview</h2>
            <div className="h-96">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryRatings.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{category.categoryName || `Category ${category.categoryId}`}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 w-36">Rating:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(category.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-gray-700">{category.rating.toFixed(1)}/500</span>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 w-36">Accuracy:</span>
                  <span className="text-gray-700">
                    {category.correctAnswers}/{category.totalQuestions} ({(category.correctAnswers / category.totalQuestions * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 w-36">Last Updated:</span>
                  <span className="text-gray-700">{new Date(category.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No category ratings available. Complete some tests in different categories to see your performance.</p>
        </div>
      )}
    </div>
  );
}