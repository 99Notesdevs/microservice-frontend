"use client";
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
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/route';

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
  // const [allCategories, setAllCategories] = useState<CategoryDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [currentLevelCategories, setCurrentLevelCategories] = useState<CategoryDetails[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user's category ratings
        const ratingsResponse = await api.get(`/ratingCategory/user/${user?.id}`)
        const typedRatingsResponse = ratingsResponse as { success: boolean; data: any };
        if (!typedRatingsResponse.success) {
          throw new Error("Failed to fetch review data")
        }
        const ratings = Array.isArray(typedRatingsResponse.data) 
          ? typedRatingsResponse.data 
          : [typedRatingsResponse.data];

        // 2. Get all categories
        const allCategoriesResponseapi = await api.get(`/categories`);
        const typedAllCategoriesResponseapi = allCategoriesResponseapi as { success: boolean; data: any };
        if (!typedAllCategoriesResponseapi.success) {
          throw new Error("Failed to fetch review data")
        }
        const allCategoriesResponse = typedAllCategoriesResponseapi.data

        // 3. Combine ratings with category data
        const categoriesWithRatings = allCategoriesResponse.map((category: any) => {
          const ratingData = ratings.find((r: any) => r.categoryId === category.id);
          return {
            ...category,
            rating: ratingData?.rating || 0,
            totalQuestions: ratingData?.totalQuestions || 0,
            correctAnswers: ratingData?.correctAnswers || 0,
            children: []
          };
        });

        // 4. Build category hierarchy and set root categories
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
        setCurrentLevelCategories(rootCategories); // Set initial view to root categories
        // setAllCategories(Array.from(categoryMap.values()));
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // Handle bar click to drill down
  const handleBarClick = (elements: any) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedCategory = currentLevelCategories[clickedIndex];
      
      // If category has children, drill down
      if (clickedCategory.children && clickedCategory.children.length > 0) {
        setCurrentPath(prev => [...prev, clickedCategory.id]);
        setCurrentLevelCategories(clickedCategory.children);
      }
    }
  };

  // Handle drill up
  const handleDrillUp = () => {
    if (currentPath.length > 0) {
      const newPath = [...currentPath];
      newPath.pop(); // Remove last element
      setCurrentPath(newPath);
      
      // Find the categories at the new path level
      if (newPath.length === 0) {
        setCurrentLevelCategories(categories); // Back to root categories
      } else {
        let current = [...categories];
        let targetCategories = [...categories];
        
        // Find the parent category
        for (const id of newPath) {
          const found = current.find(cat => cat.id === id);
          if (found?.children) {
            targetCategories = found.children;
            current = found.children;
          }
        }
        setCurrentLevelCategories(targetCategories);
      }
    } else {
      // If already at root, do nothing
      setCurrentLevelCategories(categories);
    }
  };

  // Prepare data for the bar chart (current level categories)
  const chartData = {
    labels: currentLevelCategories.map(cat => cat.name),
    datasets: [{
      label: 'Rating',
      data: currentLevelCategories.map(cat => (cat.rating || 0) * 100), // Convert 0-5 to 0-500
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    onClick: handleBarClick,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: currentPath.length > 0 ? 'Subcategories' : 'Root Categories',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Rating: ${(context.raw / 100).toFixed(1)}/5`;
          }
        }
      }
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
          stepSize: 100,
          callback: function(value: any) {
            return (value / 100).toFixed(1); // Show 0.0 to 5.0 on y-axis
          }
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Performance Report</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {currentPath.length > 0 ? 'Subcategories' : 'Root Categories'}
          </h2>
          {currentPath.length > 0 && (
            <button
              onClick={handleDrillUp}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Parent
            </button>
          )}
        </div>
        <div className="h-80">
          <Bar 
            data={chartData} 
            options={{
              ...chartOptions,
              onClick: handleBarClick,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      return `Rating: ${(context.raw / 100).toFixed(1)}/5`;
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Category Hierarchy */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Category Hierarchy</h2>
        <div className="space-y-4">
          {categories.map(category => renderCategoryCard(category))}
        </div>
      </div>
    </div>
  );
}