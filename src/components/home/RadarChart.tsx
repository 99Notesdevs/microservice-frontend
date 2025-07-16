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

interface ReferenceRadarData {
  subject: string;
  inner: number;
  outer: number;
}

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
    <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row items-center" style={{ minHeight: 300 }}>
      {/* Left: Subjectwise Rating, Strength, Weakness */}
      <div className="flex flex-col items-start justify-center min-w-[320px] mr-4">
        <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-4">
        </div>
        <div className="mb-10 w-full relative">
          <div className="relative">
            <span className="bg-white border-2 border-green-600 px-6 py-1 rounded font-bold text-xl z-10 absolute left-1/2 -translate-x-1/2 -top-6 shadow-sm">Strength</span>
            <div className="w-full min-h-12 bg-green-500 rounded-2xl opacity-80 flex items-center justify-center py-3 px-6">
              <div className="text-lg font-serif text-black text-center whitespace-pre-wrap">
                {strengths.join(', ')}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full relative">
          <div className="relative">
            <span className="bg-white border-2 border-yellow-500 px-6 py-1 rounded font-bold text-xl z-10 absolute left-1/2 -translate-x-1/2 -top-6 shadow-sm">Weakness</span>
            <div className="w-full min-h-12 bg-yellow-400 rounded-2xl opacity-80 flex items-center justify-center py-3 px-6">
              <div className="text-lg font-serif text-black text-center whitespace-pre-wrap">
                {weakness.join(', ')}
              </div>
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
