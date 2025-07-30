// pages/Category.tsx
import { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { CategorySelection } from '../components/home/CategorySelection';
import { api } from '@/api/route';

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
  const categorySectionRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded
  const [testStats, setTestStats] = useState<TestStats>({
    correctAttempted: 0,
    wrongAttempted: 0,
    notAttempted: 0,
    partialAttempted: 0,
    partialNotAttempted: 0,
    partialWrongAttempted: 0,
    timeTaken: 0,
    questionsSingle: 0,
    questionsMultiple: 0,
  });
  const [testPatterns, setTestPatterns] = useState<TestPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSingleCategories, setSelectedSingleCategories] = useState<number[]>([]);
  const [selectedMultipleCategories, setSelectedMultipleCategories] = useState<number[]>([]);
  const [showCategoryPrompt, setShowCategoryPrompt] = useState(false);
  const [alert, setAlert] = useState<{ message: string; variant: 'default' | 'destructive' } | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch test patterns once on mount
  useEffect(() => {
    const fetchTestPatterns = async () => {
      try {
        const response = await api.get(`/test`);
        const result = response as { success: boolean; data: any };
        if (!result.success) {
          throw new Error('Failed to fetch test patterns');
        }
        setTestPatterns(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test patterns');
        console.error('Error fetching test patterns:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestPatterns();
  }, []);

  const handleSelectPattern = (pattern: TestPattern) => {
    setSelectedPattern(pattern.id);
    setTestStats({
      correctAttempted: pattern.correctAttempted,
      wrongAttempted: pattern.wrongAttempted,
      notAttempted: pattern.notAttempted,
      partialAttempted: pattern.partialAttempted ?? 0,
      partialNotAttempted: pattern.partialNotAttempted ?? 0,
      partialWrongAttempted: pattern.partialWrongAttempted ?? 0,
      timeTaken: pattern.timeTaken,
      questionsSingle: pattern.questionsSingle,
      questionsMultiple: pattern.questionsMultiple ?? 0,
    });
    setShowCategoryPrompt(true);
    setIsExpanded(false); // Collapse test parameters section on selection

    // Scroll after short delay to update state
    setTimeout(() => {
      categorySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleChange = (field: keyof TestStats, value: number) => {
    if (field === 'timeTaken') {
      // Clamp timeTaken to positive numbers only
      const clamped = Math.max(0, Math.min(3600, value));
      setTestStats((prev) => ({ ...prev, [field]: clamped }));
    } else {
      // Allow positive and negative counts within -1000 to 1000
      const clamped = Math.min(1000, Math.max(-1000, value));
      setTestStats((prev) => ({ ...prev, [field]: clamped }));
    }
  };

  const showAlert = (message: string, variant: 'default' | 'destructive' = 'destructive') => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    setAlert({ message, variant });
    alertTimeoutRef.current = setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  const handleStartTest = () => {
    if (selectedSingleCategories.length === 0 && selectedMultipleCategories.length === 0) {
      showAlert('Please select at least one category!');
      return;
    }

    const hasValidTime = testStats.timeTaken > 0;
    const hasValidQuestions = (testStats.questionsSingle ?? 0) > 0 || (testStats.questionsMultiple ?? 0) > 0;

    if (!hasValidTime && !hasValidQuestions) {
      showAlert('Please enter a valid time (greater than 0) or at least one question type with a count greater than 0');
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
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray2100 py-12 px-4 sm:px-6 md:px-8">
      {isLoading ? (
        <div className="text-center py-8">Loading test patterns...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : testPatterns.length > 0 ? (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-yellow-100/50">
            <h2 className="text-2xl font-bold text-yellow-600 mb-6">Saved Test Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  onClick={() => handleSelectPattern(pattern)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02] ${
                    selectedPattern === pattern.id
                      ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl text-gray-900">{pattern.name}</h3>
                    {pattern.description && <p className="text-sm text-gray-600">{pattern.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        {pattern.questionsSingle} Single
                      </span>
                      {pattern.questionsMultiple !== undefined && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                          </svg>
                          {pattern.questionsMultiple} Multiple
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pattern.timeTaken}min
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created: {new Date(pattern.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto" ref={categorySectionRef}>
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 border border-orange-100/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Category Selector */}
            <div className="lg:order-1">
              {showCategoryPrompt && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">Please select your categories and click 'Start Test' to begin.</p>
                    </div>
                  </div>
                </div>
              )}
              <CategorySelection
                onSingleSelectionChange={setSelectedSingleCategories}
                onMultipleSelectionChange={setSelectedMultipleCategories}
              />
            </div>

            {/* Test Parameters Section */}
            <div className="lg:order-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Customize Your Test Parameters
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="px-6 py-5 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <svg
                          className={`w-5 h-5 mr-2 text-gray-600 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Test Parameters
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500">{isExpanded ? 'Hide' : 'Show'} details</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Configure your test settings and metrics</p>
                </div>

                {isExpanded && (
                  <div className="p-4 transition-all duration-300">
                    <div className="group">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                        Time (minutes)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={3600}
                          value={testStats.timeTaken}
                          onChange={(e) =>
                            handleChange('timeTaken', e.target.value === '' ? 0 : Number(e.target.value))
                          }
                          className="w-full px-4 py-2.5 text-gray-800 bg-white border border-gray-200 rounded-lg 
                            focus:ring-2 focus:ring-amber-200 focus:border-amber-400 focus:outline-none
                            transition-all duration-200 shadow-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-400 text-sm">min</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                        Question Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {(['correctAttempted', 'wrongAttempted', 'notAttempted'] as (keyof TestStats)[]).map((field) => (
                          <div key={field} className="group">
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                              {field.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min={-1000}
                                max={1000}
                                value={testStats[field] ?? ''}
                                onChange={(e) =>
                                  handleChange(field, e.target.value === '' ? 0 : parseInt(e.target.value))
                                }
                                className="w-full px-4 py-2.5 text-gray-800 bg-white border border-gray-200 rounded-lg 
                                  focus:ring-2 focus:ring-amber-200 focus:border-amber-400 focus:outline-none
                                  transition-all duration-200 shadow-sm"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-400 text-sm">Q</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                        Question Types
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {(['questionsSingle', 'questionsMultiple'] as (keyof TestStats)[]).map((field) => (
                          <div key={field} className="group">
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                              {field.replace(/([A-Z])/g, ' $1')}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min={-1000}
                                max={1000}
                                value={testStats[field] ?? ''}
                                onChange={(e) =>
                                  handleChange(field, e.target.value === '' ? 0 : parseInt(e.target.value))
                                }
                                className="w-full px-4 py-2.5 text-gray-800 bg-white border border-gray-200 rounded-lg 
                                  focus:ring-2 focus:ring-amber-200 focus:border-amber-400 focus:outline-none
                                  transition-all duration-200 shadow-sm"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-400 text-sm">Q</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                        Partial Attempts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: 'partialAttempted', label: 'Partial Attempted' },
                          { key: 'partialNotAttempted', label: 'Partial Not Attempted' },
                          { key: 'partialWrongAttempted', label: 'Partial Wrong Attempted' },
                        ].map(({ key, label }) => (
                          <div key={key} className="group">
                            <label className="block text-xs font-medium text-gray-600 mb-1.5 whitespace-nowrap overflow-hidden overflow-ellipsis">
                              {label}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min={-1000}
                                max={1000}
                                value={testStats[key as keyof TestStats] ?? ''}
                                onChange={(e) =>
                                  handleChange(
                                    key as keyof TestStats,
                                    e.target.value === '' ? 0 : parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-4 py-2.5 text-gray-800 bg-white border border-gray-200 rounded-lg 
                                  focus:ring-2 focus:ring-amber-200 focus:border-amber-400 focus:outline-none
                                  transition-all duration-200 shadow-sm"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-400 text-sm">Q</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 text-center pt-6 border-t border-orange-100">
                <Button
                  onClick={handleStartTest}
                  className="inline-flex items-center justify-center px-12 py-4 text-lg font-semibold 
                    bg-yellow-500
                    hover:bg-yellow-600
                    text-white shadow-lg hover:shadow-2xl
                    transition-all duration-300 rounded-xl transform hover:-translate-y-1
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    active:scale-95 active:shadow-inner active:bg-yellow-600
                    border-2 
                    focus:outline-none focus:ring-2 focus:ring-offset-2"
                  disabled={selectedSingleCategories.length === 0 && selectedMultipleCategories.length === 0}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Test
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
          <Alert variant={alert.variant}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
