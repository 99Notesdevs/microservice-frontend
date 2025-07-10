import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LayoutGrid, CheckCircle, ChevronRight } from 'lucide-react';

const FeatureItem: React.FC<{ icon: React.ComponentType<any>; text: string }> = ({ icon: Icon, text }) => (
  <div className="flex items-center space-x-2">
    <Icon className="w-5 h-5 text-green-500 flex-shrink-0" />
    <span className="text-gray-700">{text}</span>
  </div>
);

const TestSelection: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Create Test',
      subtitle: 'Build Your Own',
      icon: BookOpen,
      color: 'from-amber-400 to-orange-500',
      btnText: 'Create Now',
      features: [
        'Tailored to your needs',
        'Flexible timing',
        'Target weak areas',
        'Save & retake'
      ],
      onClick: () => navigate('/create-test')
    },
    {
      title: 'Test Series',
      subtitle: 'Structured Learning',
      icon: LayoutGrid,
      color: 'from-blue-400 to-indigo-600',
      btnText: 'Explore',
      features: [
        'Exam simulations',
        'Track progress',
        'Expert-curated',
        'Performance analytics'
      ],
      onClick: () => navigate('/packages')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12">
          {options.map((option, index) => (
            <div 
              key={index}
              onClick={option.onClick}
              className="group relative bg-white rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-400 cursor-pointer border-2 border-transparent hover:border-opacity-20 overflow-hidden"
            >
              {/* Decorative Elements */}
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-500" 
                   style={{ background: `radial-gradient(circle, ${option.color.split(' ')[1]} 0%, transparent 70%)` }}>
              </div>
              
              <div className="relative z-10">
                <div className={`w-24 h-24 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${option.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <option.icon className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-4xl font-extrabold text-gray-900 mb-3">{option.title}</h2>
                <p className="text-xl text-gray-600 mb-8 font-medium">{option.subtitle}</p>
                
                <ul className="space-y-4 mb-10">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2.5 mr-3 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                      <span className="text-lg text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-4 px-8 rounded-xl text-xl font-semibold text-white bg-gradient-to-r ${option.color} hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2`}
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick();
                  }}
                >
                  <span>{option.btnText}</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestSelection;
