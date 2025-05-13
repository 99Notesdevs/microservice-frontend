import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { env } from '../../config/env';
import { Button } from '../ui/button';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  pageId: number | null;
  parentTagId: number | null;
  children?: Category[];
  isExpanded?: boolean;
}

export const CategorySelection = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform flat categories array into a tree structure
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const tree: Category[] = [];

    // First pass: Create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [], isExpanded: false });
    });

    // Second pass: Build the tree
    categoryMap.forEach(category => {
      if (category.parentTagId === null) {
        // This is a root category
        tree.push(category);
      } else {
        // This is a child category, find its parent
        const parent = categoryMap.get(category.parentTagId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(category);
        }
      }
    });

    return tree;
  };

    // Check if a category is selected
    const isCategorySelected = (category: Category): boolean => {
      return selectedCategories.some(selected => selected.id === category.id);
    };
  
    // Toggle all child categories
    // @ts-ignore - Will be used later
    const toggleAllChildren = (category: Category, select: boolean) => {
      const updateChildren = (cat: Category): Category => {
        const updatedChildren = cat.children?.map(child => ({
          ...updateChildren(child),
          isExpanded: cat.isExpanded
        })) || [];
  
        return {
          ...cat,
          children: updatedChildren
        };
      };

    const updatedCategories = updateChildren(category);
    
    // Update the categories state to reflect the UI changes
    const updateCategoryInTree = (items: Category[]): Category[] => {
      return items.map(item => {
        if (item.id === category.id) {
          return updatedCategories;
        }
        if (item.children) {
          return {
            ...item,
            children: updateCategoryInTree(item.children)
          };
        }
        return item;
      });
    };

    setCategories(prev => updateCategoryInTree(prev));
  };

  // Handle category selection with child toggling
  const handleCategorySelect = (category: Category, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Toggle selection for the clicked category
    const newSelectedCategories = isCategorySelected(category)
      ? selectedCategories.filter(cat => cat.id !== category.id)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
  };

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
        // Build the category tree from the flat data
        const categoryTree = buildCategoryTree(data);
        setCategories(categoryTree);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (category: Category, event: React.MouseEvent) => {
    event.stopPropagation();
    // Toggle the expanded state of the clicked category
    const toggle = (items: Category[]): Category[] => {
      return items.map(item => {
        if (item.id === category.id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: toggle(item.children) };
        }
        return item;
      });
    };

    setCategories(toggle(categories));
  };

  const handleGiveTest = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    const categoryIds = selectedCategories.map(cat => cat.id).join(',');
    navigate(`/testPortal?categoryIds=${categoryIds}`);
  };

  // Recursive component to render categories and their children
  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = isCategorySelected(category);

    return (
      <div key={category.id} className="w-full">
        <div 
          className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
            isSelected 
              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-orange-500' 
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => handleCategorySelect(category, e)}
        >
          {hasChildren && (
            <button 
              onClick={(e) => toggleCategory(category, e)}
              className="mr-2 text-gray-500 hover:text-orange-500 focus:outline-none"
            >
              {category.isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6"></div>}
          
          <div className="flex-1 flex items-center">
            <div className={`font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
              {category.name}
            </div>
          </div>
          
          <div className="flex items-center ml-2">
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && category.isExpanded && (
          <div className="ml-4 border-l-2 border-gray-200">
            {category.children?.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Categories</h2>
        <p className="text-gray-600">
          {selectedCategories.length > 0 
            ? `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`
            : 'Choose one or more categories for your test'}
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-medium text-gray-700">Available Categories</h3>
          {selectedCategories.length > 0 && (
            <button 
              onClick={() => setSelectedCategories([])}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {categories.length > 0 ? (
            categories.map(category => renderCategory(category))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No categories available
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={handleGiveTest}
          disabled={selectedCategories.length === 0}
          className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-yellow-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="mr-2">📝</span>
          {selectedCategories.length > 0 
            ? `Start Test (${selectedCategories.length} selected)`
            : 'Select categories to begin'}
        </Button>
      </div>
    </div>
  );
};
