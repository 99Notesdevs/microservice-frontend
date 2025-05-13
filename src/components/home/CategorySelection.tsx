import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ChevronsUpDown } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-[600px] space-y-8 relative p-4 sm:p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-yellow-100 hover:shadow-3xl transition-all duration-300 max-w-full w-full sm:max-w-xl mx-auto" ref={containerRef}>
      <div className="flex flex-col items-center gap-6 mb-4">
        <div className="text-center space-y-2 w-full">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-transparent bg-clip-text drop-shadow-lg tracking-tight flex items-center gap-3 justify-center">
            <span className="inline-block animate-bounce">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="url(#grad)" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#facc15" />
                    <stop offset="1" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            Select Category
          </h2>
          <p className="text-orange-600/80 font-medium">Choose your preferred study category</p>
        </div>
        
        <Button
          variant="outline"
          className={`w-full max-w-xs sm:max-w-sm border-2 border-orange-400 text-orange-600 bg-white/90 hover:bg-yellow-100 focus:ring-4 focus:ring-orange-200 shadow-lg text-lg font-semibold transition-all duration-300 rounded-2xl py-4 sm:py-6 flex items-center justify-between gap-3 group ${
            showDropdown ? 'ring-4 ring-orange-200 bg-yellow-50' : ''
          }`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="flex items-center gap-2">
            <svg className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="url(#grad)" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#facc15" />
                  <stop offset="1" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold text-lg">{selectedCategory?.name || 'Choose a Category'}</span>
          </span>
          <ChevronsUpDown className={`ml-2 h-5 w-5 shrink-0 opacity-80 group-hover:text-orange-500 transition-all duration-300 ${
            showDropdown ? 'rotate-180' : ''
          }`} />
        </Button>
      </div>

      <div
        className={`fixed sm:absolute left-1/2 -translate-x-1/2 w-full max-w-xs sm:max-w-sm mx-auto origin-top overflow-visible transition-all duration-300 z-[100] ${
          showDropdown 
            ? 'opacity-100 scale-100 translate-y-2' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        style={{
          top: containerRef.current ? 
            `${Math.min(
              containerRef.current.getBoundingClientRect().top + window.scrollY + 180,
              window.innerHeight - 400
            )}px` : '0',
        }}
      >
        <div
          ref={dropdownRef}
          className="rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-orange-200 border border-yellow-100 overflow-hidden transform transition-transform duration-300"
          style={{
            maxHeight: showDropdown ? '60vh' : '0',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="p-4 border-b border-orange-100 last:border-none hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300"
            >
              <div className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                {category.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.subcategories?.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleCategorySelect(subcategory)}
                    className={`group px-4 py-3 rounded-xl text-base font-semibold shadow-sm border focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 flex items-center gap-3 relative overflow-hidden ${
                      selectedCategory?.id === subcategory.id
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-transparent scale-105 ring-2 ring-orange-300'
                        : 'bg-white text-orange-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 hover:text-orange-900 border-orange-100'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
                      selectedCategory?.id === subcategory.id ? 'bg-white' : 'bg-orange-400'
                    }`} />
                    <span className="z-10 text-sm">{subcategory.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8 w-full">
        <Button
          onClick={() => {
            if (selectedCategory) {
              window.location.href = '/testPortal';
            }
          }}
          disabled={!selectedCategory}
          variant="primary"
          className={`w-full max-w-xs sm:max-w-sm py-4 sm:py-6 text-lg font-extrabold uppercase tracking-widest rounded-2xl transition-all duration-300 border-0 ${
            selectedCategory
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:from-yellow-500 hover:to-orange-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="mr-2">🚀</span> Give Test
        </Button>
      </div>
    </div>
  );
};
