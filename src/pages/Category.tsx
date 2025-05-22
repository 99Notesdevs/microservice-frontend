// pages/Category.tsx
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CategorySelection } from '../components/home/CategorySelection';
import { env } from '../config/env';
import Cookies from 'js-cookie';
// import type { CategoryType } from '../components/home/CategorySelection';

// Add this interface at the top of the file
interface TestPattern {
  id: string;
  correctAttempted: number;
  wrongAttempted: number;
  notAttempted: number;
  partialAttempted?: number;
  partialNotAttempted?: number;
  partialWrongAttempted?: number;
  timeTaken: number;
  questionsSingle: number;
  questionsMultiple?: number;
  name: string;
  description?: string;
  createdAt: string;
}

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
  const [testPatterns, setTestPatterns] = useState<TestPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSingleCategories, setSelectedSingleCategories] = useState<number[]>([]);
  const [selectedMultipleCategories, setSelectedMultipleCategories] = useState<number[]>([]);
  // Add this effect to fetch test patterns
  useEffect(() => {
    const fetchTestPatterns = async () => {
      try {
        const response = await fetch(`${env.API}/test`,{
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch test patterns');
        }
        const testPatternsData = await response.json();
        setTestPatterns(testPatternsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test patterns');
        console.error('Error fetching test patterns:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestPatterns();
  }, []);
  // Add this handler to apply a test pattern
  const handleSelectPattern = (pattern: TestPattern) => {
    setSelectedPattern(pattern.id);
    setTestStats({
      correctAttempted: pattern.correctAttempted,
      wrongAttempted: pattern.wrongAttempted,
      notAttempted: pattern.notAttempted,
      partialAttempted: pattern.partialAttempted,
      partialNotAttempted: pattern.partialNotAttempted,
      partialWrongAttempted: pattern.partialWrongAttempted,
      timeTaken: pattern.timeTaken,
      questionsSingle: pattern.questionsSingle,
      questionsMultiple: pattern.questionsMultiple,
    });
  };
  const handleChange = (field: keyof TestStats, value: number) => {
    const clamped = Math.max(0, Math.min(field === 'timeTaken' ? 3600 : 1000, value));
    setTestStats(prev => ({ ...prev, [field]: clamped }));
  };

  const handleStartTest = () => {
    if (selectedSingleCategories.length === 0 && selectedMultipleCategories.length === 0) {
      alert('Please select at least one category!');
      return;
    }
  
    const params = new URLSearchParams();
    if (selectedSingleCategories.length > 0) {
      params.append('categoryS', selectedSingleCategories.join(','));
    }
    if (selectedMultipleCategories.length > 0) {
      params.append('categoryM', selectedMultipleCategories.join(','));
    }
    Object.entries(testStats).forEach(([key, value]) => {
      if (value != null) params.append(key, value.toString());
    });
  
    navigate(`/socket-test?${params.toString()}`);
  };

  return (
    <div className="min-h-screen  w-full w-max-2000px bg-gray-200 py-10 px-4 sm:px-6">
      {isLoading ? (
        <div className="text-center py-8">Loading test patterns...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : testPatterns.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-orange-100">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Saved Test Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  onClick={() => handleSelectPattern(pattern)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedPattern === pattern.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <h3 className="font-semibold text-lg text-gray-800">{pattern.name}</h3>
                  {pattern.description && (
                    <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {pattern.questionsSingle} Single
                    </span>
                    {pattern.questionsMultiple && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {pattern.questionsMultiple} Multiple
                      </span>
                    )}
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {pattern.timeTaken}s
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(pattern.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-orange-100">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-orange-500 mb-12">
            Test Configuration
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Marks Section */}
            <div className="space-y-6 bg-white/70 p-8 rounded-2xl shadow-lg border border-orange-100">
              <h2 className="text-2xl font-semibold text-orange-600 mb-6 pb-2 border-b border-orange-200">
                Test Parameters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(['correctAttempted', 'wrongAttempted', 'notAttempted','questionsSingle', 'questionsMultiple'] as (keyof TestStats)[]).map(field => (
                  <div key={field} className="group transition-all duration-300 hover:transform hover:scale-102">
                    <label className="block text-sm font-medium text-yellow-700 mb-2 capitalize group-hover:text-orange-500">
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="number"
                      value={testStats[field] ?? ''}
                      onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                      focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                      bg-white hover:bg-orange-50/50 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {(['partialAttempted', 'partialNotAttempted', 'partialWrongAttempted'] as (keyof TestStats)[]).map(field => (
                  <div key={field} className="group transition-all duration-300 hover:transform hover:scale-102">
                    <label className="block text-sm font-medium text-yellow-700 mb-2 capitalize group-hover:text-orange-500">
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="number"
                      value={testStats[field] ?? ''}
                      onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                      focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                      bg-white hover:bg-orange-50/50 transition-all duration-200"
                    />
                  </div>
                ))}
                <div className="group transition-all duration-300 hover:transform hover:scale-102">
                  <label className="block text-sm font-medium text-yellow-700 mb-2 group-hover:text-orange-500">
                    Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={testStats.timeTaken}
                    onChange={(e) => handleChange('timeTaken', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                    focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                    bg-white hover:bg-orange-50/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div className="bg-gradient-to-br from-orange-50/50 to-yellow-50/50 p-8 rounded-xl border border-orange-100 shadow-sm">
              <h2 className="text-2xl font-semibold text-orange-600 mb-6">Select Categories</h2>
              <CategorySelection onSingleSelectionChange={setSelectedSingleCategories} onMultipleSelectionChange={setSelectedMultipleCategories} />
            </div>
          </div>

          <div className="mt-12 text-center pt-6 border-t border-orange-100">
            <Button
              onClick={handleStartTest}
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-orange-400 to-yellow-500
              hover:from-orange-500 hover:to-yellow-600 text-white shadow-xl hover:shadow-2xl
              transition-all duration-300 rounded-xl transform hover:-translate-y-1
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={selectedSingleCategories.length === 0 && selectedMultipleCategories.length === 0}
            >
              🚀 Start Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
