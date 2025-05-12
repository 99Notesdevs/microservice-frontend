import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { env } from '../../config/env';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  pageId: number | null;
  parentTagId: string | null;
}

export const CategorySelection = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${env.API}/categories`, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const { data } = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategorySelect = (category: Category) => {
    const isSelected = selectedCategories.some(c => c.id === category.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const isSelected = (category: Category) => {
    return selectedCategories.some(c => c.id === category.id);
  };

  const handleGiveTest = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    // Convert category IDs to string format
    const categoryIds = selectedCategories.map(cat => cat.id.toString()).join(',');
    navigate(`/testPortal?categoryIds=${categoryIds}`);
  };

  if (isLoading) {
    return <div className="text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700">Categories</div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`flex flex-col items-center justify-center rounded-lg border px-4 py-3 text-center transition-all duration-200 ${
              isSelected(category)
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">{category.name}</div>
            <div className="mt-1 text-xs text-gray-500">
              {category.pageId ? 'Page' : 'No Page'}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4">
  <button
    onClick={handleGiveTest}
    disabled={selectedCategories.length === 0}
    className="w-full flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span className="mr-2">📝</span>
    Give Test
  </button>
</div>
    </div>
  );
};
