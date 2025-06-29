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
import Cookies from 'js-cookie';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryDetails {
  id: number;
  name: string;
  weight: string;
  parentTagId: number | null;
  rating?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  children?: CategoryDetails[];
}

export default function ReportCard() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryDetails[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user's category ratings
        const ratingsResponse = await axios.get(`${env.API}/ratingCategory/user/${user?.id}`, {
          headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        });

        const ratings = Array.isArray(ratingsResponse.data.data) 
          ? ratingsResponse.data.data 
          : [ratingsResponse.data.data];

        // 2. Get all categories
        const allCategoriesResponse = await axios.get(`${env.API}/categories`, {
          headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        });

        // 3. Combine ratings with category data
        const categoriesWithRatings = allCategoriesResponse.data.data.map((category: any) => {
          const ratingData = ratings.find((r: any) => r.categoryId === category.id);
          return {
            ...category,
            rating: ratingData?.rating || 0,
            totalQuestions: ratingData?.totalQuestions || 0,
            correctAnswers: ratingData?.correctAnswers || 0,
            children: []
          };
        });

        setAllCategories(categoriesWithRatings);

        // 4. Build category hierarchy
        const categoryMap = new Map<number, CategoryDetails>();
        const rootCategories: CategoryDetails[] = [];

        // First pass: create map of all categories
        categoriesWithRatings.forEach((category: CategoryDetails) => {
          categoryMap.set(category.id, { ...category, children: [] });
        });

        // Second pass: build hierarchy
        categoriesWithRatings.forEach((category: CategoryDetails) => {
          const node = categoryMap.get(category.id);
          if (node) {
            if (category.parentTagId === null) {
              rootCategories.push(node);
            } else {
              const parent = categoryMap.get(category.parentTagId);
              if (parent?.children) {
                parent.children.push(node);
              }
            }
          }
        });

        setCategories(rootCategories);
        setExpandedCategories(rootCategories.map(cat => cat.id)); // Expand all by default
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // Prepare data for the bar chart (top 10 categories by rating)
  const chartData = {
    labels: [...allCategories]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map(cat => cat.name),
    datasets: [{
      label: 'Rating',
      data: [...allCategories]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10)
        .map(cat => (cat.rating || 0)), // Convert 0-5 to 0-500
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Categories by Rating',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 500,
        title: {
          display: true,
          text: 'Rating (out of 500)'
        },
        ticks: {
          // Show tick marks at every 100 points
          stepSize: 100
        }
      }
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderCategoryCard = (category: CategoryDetails, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.includes(category.id);

    return (
      <div key={category.id} className="mb-4">
        <div 
          className={`bg-white rounded-lg shadow-md p-4 transition-all duration-200
            ${level > 0 ? 'ml-6 border-l-4 border-blue-200' : ''}
            hover:shadow-lg cursor-pointer`}
          onClick={() => toggleCategory(category.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">{category.name}</h3>
              <div className="text-sm text-gray-500 mt-1">
                Weight: {parseFloat(category.weight) * 100}%
              </div>
            </div>
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {category.rating?.toFixed(1) || 'N/A'}/5
              </span>
              {hasChildren && (
                <svg 
                  className={`w-5 h-5 ml-2 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children?.map(child => renderCategoryCard(child, level + 1))}
          </div>
        )}
      </div>
    );
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">Performance Report</h1>
      
      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Category Hierarchy */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Category Performance</h2>
        <div className="space-y-4">
          {categories.map(category => renderCategoryCard(category))}
        </div>
      </div>
    </div>
  );
}