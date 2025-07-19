import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LayoutGrid, CheckCircle, ChevronRight } from 'lucide-react';

const TestSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate('/create-test');
  };

  const handleTakeTest = () => {
    navigate('/packages');
  };

  const features = {
    createTest: [
      'Ideal for targeted practice on specific topics',
      'Perfect for last-minute revision',
      'Great for focusing on weak areas',
      'Best for customized learning paths',
      'No fixed schedule - learn at your pace'
    ],
    testSeries: [
      'Structured learning path',
      'Comprehensive coverage of all topics',
      'Simulates real exam conditions',
      'Detailed performance analysis',
      'Regular practice with new content'
    ]
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        

        {/* Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-auto mb-28 max-w-6xl">
          {/* Create Your Own Test */}
          <div 
            onClick={handleCreateTest}
            className="group relative rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 h-full flex flex-col bg-amber-50"
          >
            <div className="absolute inset-0 bg-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-amber-100 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-amber-600 shadow-inner border border-amber-100">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create Your Own Test
              </h2>
              <p className="text-gray-600 mb-6">
                Design a completely customized test tailored to your specific learning objectives and requirements.
              </p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 group-hover:border-amber-100 transition-colors">
                <button className="inline-flex items-center text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
                  <span>Start Building</span>
                  <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
            </div>
          </div>

          {/* Take Test from Series */}
          <div 
            onClick={handleTakeTest}
            className="group relative rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 h-full flex flex-col bg-blue-100"
          >
            <div className="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-blue-100 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="w-16 h-16 mb-6 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner border border-blue-100">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Take Test from Series
              </h2>
              <p className="text-gray-600 mb-6">
                Access our expertly designed test series for comprehensive exam preparation and skill assessment.
              </p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 group-hover:border-blue-100 transition-colors">
                <button className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  <span>Explore Series</span>
                  <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Test Options Comparison */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-80"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Compare Both</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-800 mb-2">
                  <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                  <h3 className="text-lg font-semibold">Create Your Own Test</h3>
                </div>
                <ul className="space-y-3.5">
                  {features.createTest.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-800 mb-2">
                  <LayoutGrid className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">Test Series</h3>
                </div>
                <ul className="space-y-3.5">
                  {features.testSeries.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelection;