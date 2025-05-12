import { useState } from 'react';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

const categories: Category[] = [
  {
    id: '1',
    name: 'General Studies',
    subcategories: [
      { id: '1.1', name: 'GS 1' },
      { id: '1.2', name: 'GS 2' },
      { id: '1.3', name: 'GS 3' },
      { id: '1.4', name: 'GS 4' }
    ]
  },
  {
    id: '2',
    name: 'Optional Subjects',
    subcategories: [
      { id: '2.1', name: 'Mathematics' },
      { id: '2.2', name: 'Physics' },
      { id: '2.3', name: 'Chemistry' }
    ]
  },
  {
    id: '3',
    name: 'Current Affairs',
    subcategories: [
      { id: '3.1', name: 'National' },
      { id: '3.2', name: 'International' },
      { id: '3.3', name: 'Economy' }
    ]
  }
];

export const CategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select Category</h2>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedCategory?.name || 'Select Category'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full mt-2 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {categories.map((category) => (
            <div key={category.id} className="px-2">
              <div className="text-sm font-medium text-gray-500">
                {category.name}
              </div>
              {category.subcategories?.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleCategorySelect(subcategory)}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    selectedCategory?.id === subcategory.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            if (selectedCategory) {
              window.location.href = '/testPortal';
            }
          }}
          disabled={!selectedCategory}
        >
          Give Test
        </Button>
      </div>
    </div>
  );
};
