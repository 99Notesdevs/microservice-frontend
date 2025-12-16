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
  Legend,
} from "recharts";

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
  raw?: number;
}


// interface ReferenceRadarData {
//   subject: string;
//   inner: number;
//   outer: number;
// }

interface RatingRadarChartProps {
  userRadarData: RadarDataPoint[];
  strengths: string[];
  weakness: string[];
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const rating = data.raw ?? data.value;
    const getRatingColor = (value: number) => {
      if (value >= 4) return 'text-green-600';
      if (value >= 2.5) return 'text-yellow-500';
      return 'text-red-600';
    };
    const getRatingText = (value: number) => {
      if (value >= 4) return 'Strong';
      if (value >= 2.5) return 'Moderate';
      return 'Needs Improvement';
    };
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg text-sm">
        <p className="font-semibold">{data.subject}</p>
        <p className={`${getRatingColor(rating)} font-medium`}>
          Rating: {rating.toFixed(1)}
        </p>
        <p className={`${getRatingColor(rating)} text-xs`}>
          {getRatingText(rating)}
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
  strengths,
  weakness,
}) => {

  // Function to determine fill color based on rating
  const getFillColor = (value: number) => {
    if (value >= 4) return '#10b981'; // Green for strong
    if (value >= 2.5) return '#f59e0b'; // Yellow for moderate
    return '#ef4444'; // Red for needs improvement
  };  
  
  // Create a custom radar with dynamic colors
  const CustomRadar = (props: any) => {
    const { points } = props;
    return (
      <g>
        <path
          d={`M${points.map((p: any) => `${p.x},${p.y}`).join('L')}Z`}
          fill={getFillColor(points[0].payload.value)}
          fillOpacity={0.6}
          stroke="#222"
          strokeWidth={1.5}
        />
      </g>
    );
  };
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
    <div className="bg-white p-2 flex flex-col md:flex-row items-center" style={{ minHeight: 300 }}>
      {/* Left: Subjectwise Rating, Strength, Weakness */}
      <div className="flex flex-col items-center md:items-start w-full md:w-[400px] space-y-8">
        {/* Strengths Card */}
        <div className="w-full relative">
          <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-1.5 rounded-full text-sm font-semibold shadow-md">
                Strengths
              </span>
            </div>
            <div className="min-h-16 flex items-center justify-center">
              <p className="text-gray-700 text-center leading-relaxed font-medium">
                {strengths.map((strength, index) => (
                  <span key={index} className="inline-block bg-green-50 text-green-800 text-sm font-medium px-3 py-1 rounded-full m-1">
                    {strength}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="w-full relative">
          <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-600 text-white px-5 py-1.5 rounded-full text-sm font-semibold shadow-md">
                Areas to Improve
              </span>
            </div>
            <div className="min-h-16 flex items-center justify-center">
              <p className="text-gray-700 text-center leading-relaxed font-medium">
                {weakness.map((item, index) => (
                  <span key={index} className="inline-block bg-orange-50 text-orange-800 text-sm font-medium px-3 py-1 rounded-full m-1">
                    {item}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Radar Chart */}
      <div className="w-full md:w-1/2 h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            cx="50%"
            cy="50%"
            outerRadius="70%"
            data={userRadarData}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <PolarGrid gridType="circle" stroke="#222" />
            <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
              <circle cx="50%" cy="50%" r={outerRadius} fill="#22c55e" fillOpacity={0.6} />
              <circle cx="50%" cy="50%" r={midRadius} fill="#3b82f6" fillOpacity={0.6} />
              <circle cx="50%" cy="50%" r={innerRadius} fill="#ef4444" fillOpacity={0.6} />
            </svg>
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => <CustomAngleTick {...props} />}
              stroke="#111"
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
              stroke="#111"
            />
            <Radar
              name="Your Score"
              dataKey="value"
              stroke="#222"
              fill="#fde68a"
              fillOpacity={0.6}
              strokeWidth={1.5}
              shape={CustomRadar}
              dot={{
                fill: '#000',
                stroke: '#fff',
                strokeWidth: 1,
                r: 4,
                fillOpacity: 1
              }}
              activeDot={{
                fill: '#fff',
                stroke: '#000',
                strokeWidth: 2,
                r: 6
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default RatingRadarChart;
