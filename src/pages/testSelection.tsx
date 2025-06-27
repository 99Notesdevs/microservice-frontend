import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, LayoutGrid, Zap, CheckCircle, Clock, BarChart2, Settings, Award } from 'lucide-react';

const TestSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate('/create-test');
  };

  const handleTakeTest = () => {
    navigate('/packages');
  };

  const FeatureItem = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex items-start space-x-3 group">
      <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
        <Icon className="w-5 h-5 text-yellow-600" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="w-full mx-auto text-center mb-20">
          <div className="inline-block mb-4 px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Choose Your Learning Path
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Elevate Your <span className="text-blue-600">Test Preparation</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Select your preferred testing approach - craft personalized assessments or explore our structured test series
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-auto mb-24">
          {/* Create Your Own Test */}
          <div 
            onClick={handleCreateTest}
            className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer hover:border-yellow-200"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create Your Own Test
              </h2>
              <p className="text-gray-600 mb-6">
                Design a completely customized test tailored to your specific learning objectives and requirements.
              </p>
              <div className="space-y-4 mb-8">
                <FeatureItem 
                  icon={Settings} 
                  title="Full Customization" 
                  description="Select topics, difficulty, and question types" 
                />
                <FeatureItem 
                  icon={Clock} 
                  title="Flexible Timing" 
                  description="Set your own pace with adjustable time limits" 
                />
                <FeatureItem 
                  icon={Zap} 
                  title="Instant Setup" 
                  description="Get started in just a few clicks" 
                />
              </div>
              <div className="flex items-center text-yellow-600 font-medium group-hover:text-yellow-700 transition-colors">
                <span>Start Building</span>
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Take Test from Series */}
          <div 
            onClick={handleTakeTest}
            className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer hover:border-blue-200"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Take Test from Series
              </h2>
              <p className="text-gray-600 mb-6">
                Access our expertly designed test series for comprehensive exam preparation and skill assessment.
              </p>
              <div className="space-y-4 mb-8">
                <FeatureItem 
                  icon={Award} 
                  title="Expertly Curated" 
                  description="Designed by subject matter experts" 
                />
                <FeatureItem 
                  icon={BarChart2} 
                  title="Performance Tracking" 
                  description="Detailed analytics and progress reports" 
                />
                <FeatureItem 
                  icon={CheckCircle} 
                  title="Structured Learning" 
                  description="Progressive difficulty and topic coverage" 
                />
              </div>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                <span>Explore Series</span>
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Test Options Comparison */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose What Suits You Best</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Both options are designed to help you succeed. Here's how they compare:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-yellow-600" />
                Create Your Own Test
              </h3>
              <ul className="space-y-4">
                {[
                  'Ideal for targeted practice on specific topics',
                  'Perfect for last-minute revision',
                  'Great for focusing on weak areas',
                  'Best for customized learning paths',
                  'No fixed schedule - learn at your pace'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <LayoutGrid className="w-6 h-6 mr-2 text-blue-600" />
                Test Series
              </h3>
              <ul className="space-y-4">
                {[
                  'Structured learning path',
                  'Comprehensive coverage of all topics',
                  'Simulates real exam conditions',
                  'Detailed performance analysis',
                  'Regular practice with new content'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelection;