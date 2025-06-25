import React from "react";
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";

interface SubjectRating {
  subject: string;
  rating: number;
}

interface ChartDataPoint {
  subject: string;
  score: number;
}

interface RatingRadarChartProps {
  data: SubjectRating[];
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
        <p className="font-medium">{payload[0].payload.subject}</p>
        <p className="text-sm">
          Score: <span className="font-medium">{payload[0].value}</span>/500
        </p>
      </div>
    );
  }
  return null;
};

const RatingRadarChart: React.FC<RatingRadarChartProps> = ({ data }) => {
  const maxScore = 500;
  const goodThreshold = 400;
  const badThreshold = 200;

  const formattedData: ChartDataPoint[] = data.map((item) => ({
    subject: item.subject,
    score: item.rating
  }));

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Subject Performance Analysis</h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/3 space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Rating Scale</h3>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-400"></div>
              <span className="text-sm text-gray-600">0 - 200: Needs Improvement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span className="text-sm text-gray-600">201 - 400: Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <span className="text-sm text-gray-600">401 - 500: Excellent</span>
            </div>
          </div>
          
          <div className="space-y-2 mt-6">
            <h3 className="font-medium text-gray-700">Performance Summary</h3>
            {formattedData.map((item) => (
              <div key={item.subject} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.subject}</span>
                <span className={`font-medium ${
                  item.score >= goodThreshold ? 'text-green-600' : 
                  item.score > badThreshold ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={formattedData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              {/* Background circles */}
              <circle cx="50%" cy="50%" r="40%" fill="#fecaca" fillOpacity={0.3} />
              <circle cx="50%" cy="50%" r="80%" fill="#bbf7d0" fillOpacity={0.3} />
              
              <PolarGrid 
                gridType="circle" 
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              
              <PolarAngleAxis
                dataKey="subject"
                stroke="#4b5563"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              <PolarRadiusAxis
                angle={30}
                domain={[0, maxScore]}
                tickCount={6}
                tickFormatter={(value) => value.toString()}
                stroke="transparent"
                tick={{ fontSize: 0 }}
              />

              {/* Custom axis labels */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ef4444"
                fontSize={10}
                style={{ fontWeight: 'bold' }}
              >
                Needs Improvement
              </text>
              
              <text
                x="50%"
                y="10%"
                textAnchor="middle"
                fill="#22c55e"
                fontSize={10}
                style={{ fontWeight: 'bold' }}
              >
                Excellent
              </text>

              <Radar
                name="Rating"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
                dot={{ fill: "#1d4ed8", stroke: "#fff", strokeWidth: 2, r: 4 }}
              />
              
              <Tooltip content={<CustomTooltip />} />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Example data
const mockData: SubjectRating[] = [
  { subject: "Math", rating: 450 },
  { subject: "English", rating: 320 },
  { subject: "Physics", rating: 280 },
  { subject: "Chemistry", rating: 150 },
  { subject: "Biology", rating: 370 },
  { subject: "Computer", rating: 490 }
];

// Example usage
const App: React.FC = () => {
  return <RatingRadarChart data={mockData} />;
};

export default App;
