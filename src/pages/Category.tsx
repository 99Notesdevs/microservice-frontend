// pages/Category.tsx
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CategorySelection } from '../components/home/CategorySelection';
// import type { CategoryType } from '../components/home/CategorySelection';

interface TestStats {
  correctAttempted: number;
  wrongAttempted: number;
  notAttempted: number;
  partialAttempted?: number;
  partialNotAttempted?: number;
  partialWrongAttempted?: number;
  timeTaken: number;
  questionsSingle: number;
  questionsMultiple?: number;
}

export const Category = () => {
  const navigate = useNavigate();
  const [testStats, setTestStats] = useState<TestStats>({
    correctAttempted: 0,
    wrongAttempted: 0,
    notAttempted: 0,
    partialAttempted: 0,
    partialNotAttempted: 0,
    partialWrongAttempted: 0,
    timeTaken: 0,
    questionsSingle: 0,
    questionsMultiple: 0
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const handleChange = (field: keyof TestStats, value: number) => {
    const clamped = Math.max(0, Math.min(field === 'timeTaken' ? 3600 : 1000, value));
    setTestStats(prev => ({ ...prev, [field]: clamped }));
  };

  const handleStartTest = () => {
    if (selectedCategoryIds.length === 0) {
      alert('Please select at least one category!');
      return;
    }
  
    const params = new URLSearchParams();
    params.append('categoryIds', selectedCategoryIds.join(',')); // Changed to single parameter
    Object.entries(testStats).forEach(([key, value]) => {
      if (value != null) params.append(key, value.toString());
    });
  
    navigate(`/socket-test?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center text-emerald-900 mb-8">
            Test Configuration
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marks Section */}
            <div className="space-y-4">
              {/* Input fields */}
              {(['correctAttempted', 'wrongAttempted', 'notAttempted', 'partialAttempted', 'partialNotAttempted', 'partialWrongAttempted'] as (keyof TestStats)[]).map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-emerald-700 mb-1 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="number"
                    value={testStats[field] ?? ''}
                    onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
              {/* Time Taken */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Time (seconds)</label>
                <input
                  type="number"
                  value={testStats.timeTaken}
                  onChange={(e) => handleChange('timeTaken', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <h2 className="text-xl font-semibold text-emerald-900 mb-2">Select Categories</h2>
              <CategorySelection onSelectionChange={setSelectedCategoryIds} />
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={handleStartTest}
              className="px-8 py-4 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              disabled={selectedCategoryIds.length === 0}
            >
              🚀 Start Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
