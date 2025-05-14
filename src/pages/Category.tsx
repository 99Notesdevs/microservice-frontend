import { useState } from 'react';
import { CategorySelection } from '../components/home/CategorySelection';

interface TestSettings {
  timeLimit: number;
  questionCount: number;
  negativeMarking: boolean;
}

export const Category = () => {
  const [testSettings, setTestSettings] = useState<TestSettings>({
    timeLimit: 30, // minutes
    questionCount: 10,
    negativeMarking: false
  });

  const handleSettingsChange = (field: keyof TestSettings, value: number | boolean) => {
    setTestSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-800">Test Configuration</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <select
                value={testSettings.timeLimit}
                onChange={(e) => handleSettingsChange('timeLimit', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={10}>10 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={testSettings.questionCount}
                onChange={(e) => handleSettingsChange('questionCount', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={20}>20 questions</option>
                <option value={30}>30 questions</option>
                <option value={50}>50 questions</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="negativeMarking"
                checked={testSettings.negativeMarking as boolean}
                onChange={(e) => handleSettingsChange('negativeMarking', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="negativeMarking" className="text-sm font-medium text-gray-700">
                Enable Negative Marking (-1 for wrong answers)
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Categories</h2>
          <CategorySelection 
            testSettings={testSettings}
            onStartTest={(selectedCategories) => {
              const params = new URLSearchParams({
                categoryIds: selectedCategories.join(','),
                limit: testSettings.questionCount.toString(),
                timeLimit: testSettings.timeLimit.toString(),
                negativeMarking: testSettings.negativeMarking.toString()
              });
              window.location.href = `/testPortal?${params.toString()}`;
            }} 
          />
        </div>
      </div>
    </div>
  );
};