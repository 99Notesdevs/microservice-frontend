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

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
  raw?: number;
}

interface ReferenceRadarData {
  subject: string;
  inner: number;
  outer: number;
}

interface RatingRadarChartProps {
  userRadarData: RadarDataPoint[];
  referenceRadarData: ReferenceRadarData[];
  minRating: number;
  maxRating: number;
  strengths: string[];
  weakness: string[];
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg text-sm">
        <p className="font-semibold">{data.subject}</p>
        <p className="text-gray-700">
          Rating: <span className="font-medium">{data.raw || data.value * 50}</span>/500
        </p>
        <p className="text-gray-600 text-xs">
          {data.raw >= 400 ? 'Excellent' : data.raw >= 200 ? 'Good' : 'Needs Improvement'}
        </p>
      </div>
    );
  }
  return null;
};
        
const outerRadius = 90;
const midRadius = 72;
const innerRadius = 36;

const RatingRadarChart: React.FC<RatingRadarChartProps> = ({
  userRadarData,
  referenceRadarData,
  strengths,
  weakness,
}) => {
  // Custom tick to show subject and rating value at each axis
  const CustomAngleTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    const subject = payload.value;
    const userPoint = userRadarData.find((d: any) => d.subject === subject);
    const rating = userPoint ? userPoint.raw ?? Math.round(userPoint.value * 50) : '';
    return (
      <g>
        <text x={x} y={y - 8} textAnchor={textAnchor} fontSize={13} fill="#222" fontWeight={500}>
          {subject}
        </text>
        {rating !== '' && (
          <text x={x} y={y + 12} textAnchor={textAnchor} fontSize={13} fill="#fde047" fontWeight={700} stroke="#222" strokeWidth={0.7}>
            {rating}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center">
      {/* Left: Subjectwise Rating, Strength, Weakness */}
      <div className="w-full md:w-2/5 space-y-6 pr-0 md:pr-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Performance Analysis</h2>
          
          {/* Strengths Section */}
          <div className="relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-30 -z-10"></div>
            <div className="flex items-start mb-4">
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Your Strengths</h3>
                <p className="text-sm text-gray-500">Areas where you excel</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.map((item, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-700 shadow-sm hover:bg-white hover:shadow transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Weaknesses Section */}
          <div className="relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 opacity-30 -z-10"></div>
            <div className="flex items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Areas to Improve</h3>
                <p className="text-sm text-gray-500">Focus areas for growth</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {weakness.map((item, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/80 backdrop-blur-sm border border-amber-100 text-amber-700 shadow-sm hover:bg-white hover:shadow transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="w-full md:w-3/5 h-80 mt-8 md:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            cx="50%"
            cy="50%"
            outerRadius="75%"
            data={referenceRadarData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid 
              gridType="circle" 
              stroke="#e5e7eb" 
              strokeDasharray="3 3"
            />
            
            {/* Background circles */}
            <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
              <circle cx="50%" cy="50%" r={outerRadius} fill="#3b82f6" fillOpacity={0.1} />
              <circle cx="50%" cy="50%" r={midRadius} fill="#3b82f6" fillOpacity={0.2} />
              <circle cx="50%" cy="50%" r={innerRadius} fill="#ef4444" fillOpacity={0.2} />
            </svg>

            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => <CustomAngleTick {...props} userRadarData={userRadarData} />}
              stroke="#4b5563"
              tickLine={false}
              axisLine={false}
            />
            
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            
            <Radar
              name="Your Rating"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              strokeWidth={2}
              dot={{
                fill: '#1d4ed8',
                stroke: '#fff',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: '#1d4ed8',
                stroke: '#fff',
                strokeWidth: 2,
                r: 6,
              }}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              wrapperStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '0.75rem',
                fontSize: '0.875rem'
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingRadarChart;
