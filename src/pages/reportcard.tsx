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
  type InteractionMode,
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
  const [_allCategories, setAllCategories] = useState<CategoryDetails[]>([]);
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
        setAllCategories(Array.from(categoryMap.values()));
        
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
  const handleBarClick = (_event: any, elements: any) => {
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
      data: currentLevelCategories.map(cat => cat.rating || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleBarClick,
    interaction: {
      mode: 'nearest' as InteractionMode,
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        // boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        callbacks: {
          label: function(context: any) {
            return `Rating: ${context.raw.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          stepSize: 1,
          callback: function(value: any) {
            return value.toFixed(1);
          }
        },
        title: {
          display: true,
          text: 'Rating (1-5)',
          color: '#4B5563',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 0
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
    const rating = category.rating || 0;
    const percentage = Math.min(100, Math.max(0, (rating / 5) * 100));

    return (
      <div key={category.id} className="mb-2">
        <div 
          className={`bg-white hover:bg-gray-50 transition-colors duration-150 ${level > 0 ? 'pl-6 border-l-2 border-gray-100' : ''}`}
        >
          <div 
            className="flex items-center justify-between p-4 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => toggleCategory(category.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                {hasChildren && (
                  <svg 
                    className={`w-4 h-4 mr-2 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <h3 className="text-sm font-medium text-gray-900 truncate">{category.name}</h3>
              </div>
              <div className="mt-1 flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-1.5 mr-2">
                  <div 
                    className="h-full rounded-full" 
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getRatingColor(rating)
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {rating.toFixed(1)}/5.0
                </span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex items-center">
              {/* <span className="text-xs text-gray-500 mr-3">
                Weight: {(parseFloat(category.weight) * 100).toFixed(0)}%
              </span> */}
              {hasChildren ? (
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <div className="w-4"></div>
              )}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children?.map(child => renderCategoryCard(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#10B981'; // Green
    if (rating >= 3) return '#3B82F6'; // Blue
    if (rating >= 2) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-700">Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h2>
        <p className="text-sm text-gray-500 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="bg-white border border-gray-100 shadow-sm rounded p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {currentPath.length > 0 ? 'Subcategory Performance' : 'Category Overview'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click on bars to drill down into subcategories
            </p>
          </div>
          {currentPath.length > 0 && (
            <button
              onClick={handleDrillUp}
              className="mt-3 sm:mt-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          )}
        </div>
        <div className="h-96">
          <Bar 
            data={chartData} 
            options={{
              ...chartOptions,
              onClick: handleBarClick,
              maintainAspectRatio: false,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  backgroundColor: 'white',
                  titleColor: '#1F2937',
                  bodyColor: '#4B5563',
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  padding: 12,
                  // boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  callbacks: {
                    label: function(context: any) {
                      return `Rating: ${(context.raw).toFixed(1)}`;
                    },
                    title: function(context: any) {
                      return context[0].label;
                    }
                  }
                },
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  },
                  ticks: {
                    color: '#6B7280',
                    font: {
                      size: 12
                    },
                    callback: function(value: any) {
                      return value.toFixed(1);
                    }
                  },
                  title: {
                    display: true,
                    text: 'Rating (1-5)',
                    color: '#4B5563',
                    font: {
                      size: 12,
                      weight: 500
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    color: '#6B7280',
                    font: {
                      size: 12
                    }
                  }
                }
              },
              elements: {
                bar: {
                  borderRadius: 4,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
                  borderWidth: 0
                }
              }
            }} 
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Detailed Breakdown</h2>
            <p className="text-sm text-gray-500 mt-1">
              Click on categories to expand and view subcategories
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span>Rating</span>
          </div>
        </div>
        <div className="space-y-3">
          {categories.map(category => renderCategoryCard(category))}
        </div>
      </div>
    </div>
  );
}