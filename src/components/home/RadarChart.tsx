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
    <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row items-center" style={{ minHeight: 300 }}>
      {/* Left: Subjectwise Rating, Strength, Weakness */}
      <div className="flex flex-col items-start justify-center min-w-[270px] mr-2">
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-4">
          <div className="text-2xl font-serif font-semibold text-gray-900 mb-2 underline underline-offset-4">
            Subjectwise Rating
          </div>
        </div>
        <div className="mb-8 w-full relative">
          <div className="relative">
            <span className="bg-white border-2 border-green-600 px-4 py-0.5 rounded font-bold text-xl z-10 absolute left-1/2 -translate-x-1/2 -top-4 shadow-sm">Strength</span>
            <div className="w-full min-h-11 bg-green-500 rounded-2xl opacity-80 flex items-center justify-center py-2 px-4">
              <div className="text-lg font-serif text-black text-center">
                {strengths.join(', ')}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full relative">
          <div className="relative">
            <span className="bg-white border-2 border-yellow-500 px-4 py-0.5 rounded font-bold text-xl z-10 absolute left-1/2 -translate-x-1/2 -top-4 shadow-sm">Weakness</span>
            <div className="w-full min-h-11 bg-yellow-400 rounded-2xl opacity-80 flex items-center justify-center py-2 px-4">
              <div className="text-lg font-serif text-black text-center">
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
            data={referenceRadarData}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <PolarGrid gridType="circle" stroke="#222" />
            <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
              <circle cx="50%" cy="50%" r={outerRadius} fill="#22c55e" fillOpacity={0.7} />
              <circle cx="50%" cy="50%" r={midRadius} fill="#3b82f6" fillOpacity={0.7} />
              <circle cx="50%" cy="50%" r={innerRadius} fill="#ef4444" fillOpacity={0.7} />
            </svg>
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => <CustomAngleTick {...props} userRadarData={userRadarData} />}
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
              name="Your Rating"
              dataKey="value"
              stroke="#222"
              fill="#fde68a"
              fillOpacity={0.7}
              strokeWidth={2}
              dot={true}
            />
            <Tooltip content={<CustomTooltip />} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingRadarChart;
