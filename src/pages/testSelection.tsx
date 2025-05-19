import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, LayoutGrid, Trophy } from 'lucide-react';

const TestSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate('/create-test');
  };

  const handleTakeTest = () => {
    navigate('/packages');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-emerald-600 mb-4">
            Choose Your Path
          </h1>
          <p className="text-gray-600 text-lg mb-12">
            Select how you want to proceed with your test preparation
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Your Own Test */}
          <button
            onClick={handleCreateTest}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Create Your Own Test
              </h2>
              <p className="text-gray-600 mb-6">
                Design your own custom test with questions of your choice
              </p>
              <div className="flex items-center gap-2 text-emerald-600 group-hover:text-emerald-700">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Take Test from Series */}
          <button
            onClick={handleTakeTest}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <LayoutGrid className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Take Test from Series
              </h2>
              <p className="text-gray-600 mb-6">
                Choose from our curated test series and practice with structured tests
              </p>
              <div className="flex items-center gap-2 text-emerald-600 group-hover:text-emerald-700">
                <span>Start Now</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow">
              <Trophy className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Content</h3>
              <p className="text-gray-600">
                Our tests are crafted by experienced educators to ensure you get the best preparation
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow">
              <BookOpen className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Customizable</h3>
              <p className="text-gray-600">
                Create tests that match your learning style and focus on your weak areas
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow">
              <LayoutGrid className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Structured Learning</h3>
              <p className="text-gray-600">
                Follow our curated test series to systematically improve your skills
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelection;