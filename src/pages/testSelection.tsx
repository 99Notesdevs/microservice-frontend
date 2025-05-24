import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, LayoutGrid } from 'lucide-react';

const TestSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate('/create-test');
  };

  const handleTakeTest = () => {
    navigate('/packages');
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-yellow-600 mb-6 tracking-tight">
            Your Path to Success
          </h1>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Choose your learning journey - customize your own tests or follow our expert-curated series
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Create Your Own Test */}
          <button
            onClick={handleCreateTest}
            className="group relative p-10 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute -top-5 -left-5 w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-yellow-600" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-semibold text-gray-900 mb-5">
                Create Your Own Test
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Craft your personalized test with questions tailored to your needs
              </p>
              <div className="flex items-center gap-3 text-yellow-600 group-hover:text-yellow-700">
                <span className="font-medium">Start Customizing</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Take Test from Series */}
          <button
            onClick={handleTakeTest}
            className="group relative p-10 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute -top-5 -left-5 w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center">
              <LayoutGrid className="w-10 h-10 text-yellow-600" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-semibold text-gray-900 mb-5">
                Take Test from Series
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Dive into our expert-curated test series for structured practice
              </p>
              <div className="flex items-center gap-3 text-yellow-600 group-hover:text-yellow-700">
                <span className="font-medium">Start Series</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        {/* Test Options Description */}
        <div className="max-w-5xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Understanding Your Test Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <BookOpen className="w-12 h-12 text-yellow-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Create Your Own Test</h3>
              </div>
              <p className="text-gray-600 mb-4">
                This option allows you to design a custom test tailored to your specific needs. You can:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6">
                <li>Select specific topics and subtopics</li>
                <li>Choose the number of questions</li>
                <li>Set time limits per question</li>
                <li>Customize difficulty levels</li>
                <li>Enable/disable negative marking</li>
              </ul>
              <p className="text-gray-600">
                Perfect for focused practice on specific areas you want to improve.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <LayoutGrid className="w-12 h-12 text-yellow-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Take Test from Series</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Our curated test series provide a structured learning path. Each series includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6">
                <li>Progressively challenging tests</li>
                <li>Topic-wise coverage</li>
                <li>Time-bound practice</li>
                <li>Performance analytics</li>
                <li>Detailed solutions and explanations</li>
              </ul>
              <p className="text-gray-600">
                Ideal for systematic preparation and tracking your progress over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelection;