// components/home/CategorySelection.tsx
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { env } from '../../config/env';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';

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
  onSelectionChange: (selectedIds: number[]) => void;
}

export const CategorySelection = ({ onSelectionChange }: CategorySelectionProps) => {
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const isCategorySelected = (category: CategoryType) => {
    return selectedCategories.some(selected => selected.id === category.id);
  };

  const handleCategorySelect = (category: CategoryType, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = isCategorySelected(category)
      ? selectedCategories.filter(cat => cat.id !== category.id)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    onSelectionChange(updated.map(cat => cat.id));
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

  const renderCategory = (category: CategoryType, level = 0): React.JSX.Element => {
    const isSelected = isCategorySelected(category);
    const hasChildren = category.children?.length;

    return (
      <div key={category.id} className="w-full">
        <div
          className={`flex items-center p-3 rounded-lg cursor-pointer ${
            isSelected
              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-orange-500'
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={e => handleCategorySelect(category, e)}
        >
          {hasChildren ? (
            <button
              onClick={e => toggleCategory(category, e)}
              className="mr-2 text-gray-500 hover:text-orange-500 focus:outline-none"
            >
              {category.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-6"></div>
          )}

          <span className={`
            font-medium transition-colors duration-200
            ${isSelected ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-900'}
          `}>
            {category.name}
          </span>

          {isSelected && (
            <div className="ml-auto transform scale-95 hover:scale-100 transition-transform">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 
                rounded-full flex items-center justify-center shadow-sm">
                <Check size={14} className="text-white" />
              </div>
            </div>
          )}
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
    return <div className="py-12 text-center text-orange-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="border-2 border-orange-100 rounded-2xl bg-white overflow-hidden shadow-lg">
      <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100">
        <h3 className="font-semibold text-lg text-orange-700">Available Categories</h3>
        <p className="text-sm text-orange-600/70 mt-1">Select categories for your test</p>
      </div>
      
      <div className="custom-scrollbar overflow-y-auto max-h-[60vh]">
        <div className="p-4 space-y-2">
          {categories.length > 0 ? (
            categories.map(category => renderCategory(category))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-orange-400 mb-2">📚</div>
              No categories available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
