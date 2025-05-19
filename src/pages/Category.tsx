import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const handleChange = (field: keyof TestStats, value: number) => {
    const minValue = 0;
    const maxValue = field === 'timeTaken' ? 3600 : 1000; // Maximum 1 hour for time, 1000 for other fields
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
    
    setTestStats(prev => ({
      ...prev,
      [field]: clampedValue
    }));
  };

  const handleStartTest = () => {
    // Navigate to test page with test stats as parameters
    const params = new URLSearchParams();
    Object.entries(testStats).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    navigate(`/test?${params.toString()}`);
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
              <h2 className="text-xl font-semibold text-emerald-900">Marks Configuration</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Marks for Correct Answer
                  </label>
                  <input
                    type="number"
                    value={testStats.correctAttempted}
                    onChange={(e) => handleChange('correctAttempted', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Marks for Wrong Answer
                  </label>
                  <input
                    type="number"
                    value={testStats.wrongAttempted}
                    onChange={(e) => handleChange('wrongAttempted', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Marks for Not Attempted
                  </label>
                  <input
                    type="number"
                    value={testStats.notAttempted}
                    onChange={(e) => handleChange('notAttempted', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Marks for Partial Answer
                  </label>
                  <input
                    type="number"
                    value={testStats.partialAttempted || ''}
                    onChange={(e) => handleChange('partialAttempted', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Marks for Partial Not Attempted
                  </label>
                  <input
                    type="number"
                    value={testStats.partialNotAttempted || ''}
                    onChange={(e) => handleChange('partialNotAttempted', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Marks for Partial Wrong Answer
                  </label>
                  <input
                    type="number"
                    value={testStats.partialWrongAttempted || ''}
                    onChange={(e) => handleChange('partialWrongAttempted', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            {/* Question Types */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">Question Types</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Single Choice Questions
                  </label>
                  <input
                    type="number"
                    value={testStats.questionsSingle}
                    onChange={(e) => handleChange('questionsSingle', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-1">
                    Multiple Choice Questions
                  </label>
                  <input
                    type="number"
                    value={testStats.questionsMultiple || ''}
                    onChange={(e) => handleChange('questionsMultiple', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            {/* Time Taken */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">Time Management</h2>
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Time Limit (in seconds)
                </label>
                <input
                  type="number"
                  value={testStats.timeTaken}
                  onChange={(e) => handleChange('timeTaken', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                  max="3600"
                />
                <p className="text-sm text-emerald-500 mt-1">
                  Maximum time limit: 1 hour (3600 seconds)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              onClick={handleStartTest}
            >
              Start Test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};