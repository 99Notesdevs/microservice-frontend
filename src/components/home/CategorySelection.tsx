// components/home/CategorySelection.tsx
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { env } from '../../config/env';
import { ChevronDown, Check, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CategoryType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  pageId: number | null;
  parentTagId: number | null;
  children?: CategoryType[];
  isExpanded?: boolean;
}

interface CategorySelectionProps {
  onSingleSelectionChange: (selectedIds: number[]) => void;
  onMultipleSelectionChange: (selectedIds: number[]) => void;
}

export const CategorySelection = ({ onSingleSelectionChange, onMultipleSelectionChange }: CategorySelectionProps) => {
  const [selectedSingleCategories, setSelectedSingleCategories] = useState<number[]>([]);
  const [selectedMultipleCategories, setSelectedMultipleCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('single');

  const buildCategoryTree = (categories: CategoryType[]): CategoryType[] => {
    const categoryMap = new Map<number, CategoryType>();
    const tree: CategoryType[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [], isExpanded: false });
    });

    categoryMap.forEach(category => {
      if (category.parentTagId === null) {
        tree.push(category);
      } else {
        const parent = categoryMap.get(category.parentTagId);
        if (parent) {
          parent.children!.push(category);
        }
      }
    });

    return tree;
  };

  const isCategorySelected = (category: CategoryType, type: 'single' | 'multiple') => {
    if (type === 'single') {
      return selectedSingleCategories.includes(category.id);
    }
    return selectedMultipleCategories.includes(category.id);
  };

  const handleSingleCategorySelect = (category: CategoryType, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = isCategorySelected(category, 'single')
      ? selectedSingleCategories.filter(id => id !== category.id)
      : [...selectedSingleCategories, category.id];
    setSelectedSingleCategories(updated);
    onSingleSelectionChange(updated);
  };

  const handleMultipleCategorySelect = (category: CategoryType, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = isCategorySelected(category, 'multiple')
      ? selectedMultipleCategories.filter(id => id !== category.id)
      : [...selectedMultipleCategories, category.id];
    setSelectedMultipleCategories(updated);
    onMultipleSelectionChange(updated);
  };

  const toggleCategory = (category: CategoryType, event: React.MouseEvent) => {
    event.stopPropagation();
    const toggle = (items: CategoryType[]): CategoryType[] =>
      items.map(item => {
        if (item.id === category.id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: toggle(item.children) };
        }
        return item;
      });

    setCategories(toggle(categories));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${env.API}/categories`, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const { data } = await response.json();
        setCategories(buildCategoryTree(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderCategory = (category: CategoryType, level = 0, type: 'single' | 'multiple'): React.JSX.Element => {
    const isSelected = isCategorySelected(category, type);
    const hasChildren = category.children?.length;

    return (
      <motion.div 
        key={`${category.id}-${type}`} 
        className="w-full"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'bg-yellow-50  border-l-4 border-yellow-500 shadow-sm'
              : 'hover:bg-gray-50 border-l-4 border-transparent'
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={e => type === 'single' ? handleSingleCategorySelect(category, e) : handleMultipleCategorySelect(category, e)}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.99 }}
        >
          {hasChildren ? (
            <button
              onClick={e => toggleCategory(category, e)}
              className="mr-3 text-gray-400 hover:text-yellow-500 focus:outline-none transition-colors"
              aria-label={category.isExpanded ? 'Collapse' : 'Expand'}
            >
              <motion.div
                animate={{ rotate: category.isExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>
          ) : (
            <div className="w-9"></div>
          )}

          <span className={`font-medium transition-colors duration-200 ${
            isSelected ? 'text-yellow-600' : 'text-gray-700 group-hover:text-gray-900'
          }`}>
            {category.name}
          </span>

          <motion.div 
            className="ml-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: isSelected ? 1 : 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-yellow-500 shadow-md' 
                : 'border-2 border-gray-300 group-hover:border-yellow-300'
            }`}>
              {isSelected && <Check size={12} className="text-white" />}
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {hasChildren && category.isExpanded && (
            <motion.div 
              className="ml-4 border-l-2 border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.children?.map(child => renderCategory(child, level + 1, type))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="mb-4 text-indigo-500"
        >
          <Loader2 size={32} />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-700">Loading Categories</h3>
        <p className="text-gray-500 mt-1">Please wait while we load your content</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <AlertCircle className="text-red-500" size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-800">Something went wrong</h3>
        <p className="text-red-500 mt-1 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <BookOpen className="text-indigo-400" size={28} />
      </div>
      <h3 className="text-lg font-medium text-gray-800">No categories available</h3>
      <p className="text-gray-500 mt-1 max-w-md">
        It seems there are no categories to display at the moment. Please check back later.
      </p>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-100">
        <div className="flex items-center"> 
      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
        <h2 className="text-xl font-bold text-gray-900">Category Selection</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Select categories for your questions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
            activeTab === 'single'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Single Choice
        </button>
        <button
          onClick={() => setActiveTab('multiple')}
          className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
            activeTab === 'multiple'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Multiple Choice
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-1"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">
                {activeTab === 'single' ? 'Single Choice Categories' : 'Multiple Choice Categories'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {activeTab === 'single'
                  ? 'Select one or more categories for single choice questions'
                  : 'Choose multiple categories for multiple choice questions'}
              </p>
            </div>
            
            <div className="custom-scrollbar overflow-y-auto max-h-[50vh] p-3">
              {categories.length > 0 ? (
                <div className="space-y-1">
                  {categories.map(category => renderCategory(category, 0, activeTab))}
                </div>
              ) : (
                renderEmptyState()
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {activeTab === 'single' 
            ? `${selectedSingleCategories.length} selected` 
            : `${selectedMultipleCategories.length} selected`}
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            onClick={() => {
              setSelectedSingleCategories([]);
              setSelectedMultipleCategories([]);
              onSingleSelectionChange([]);
              onMultipleSelectionChange([]);
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};