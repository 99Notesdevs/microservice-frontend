import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const radarData = [
  { subject: 'History', A: 80 },
  { subject: 'CSAT', A: 70 },
  { subject: 'Society', A: 60 },
  { subject: 'Polity', A: 90 },
  { subject: 'Geography', A: 75 },
  { subject: 'Agriculture', A: 50 },
  { subject: 'Economy', A: 65 },
  { subject: 'Security', A: 60 },
];

const barData = [
  { name: 'Test 1', score1: 400, score2: 300, score3: 200 },
  { name: 'Test 2', score1: 420, score2: 320, score3: 250 },
  { name: 'Test 3', score1: 440, score2: 340, score3: 270 },
  { name: 'Test 4', score1: 460, score2: 360, score3: 280 },
  { name: 'Test 5', score1: 480, score2: 380, score3: 290 },
];

export default function Dashboard() {
  return (
   
    <div className="p-4 sm:p-6 bg-gray-200 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* 1. Student Stats */}
      <div className="bg-white rounded-lg p-4 shadow mb-4 md:mb-0">
        <p className="text-xs sm:text-sm text-gray-700 mb-2">Global Rating — <span className="font-semibold">1127</span></p>
        <p className="text-xs sm:text-sm text-gray-700 mb-2">Experience Level — <span className="font-semibold">14</span>/15</p>
        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
          <div className="bg-green-500 h-2 rounded-full w-[93%]"></div>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 mb-2">Test Attempted — <span className="font-semibold">15</span></p>
        <p className="text-xs sm:text-sm text-gray-700">Status — <span className="font-semibold">Student</span></p>
      </div>

      {/* 2. Radar Chart Section */}
      <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center w-full overflow-x-auto">
        <div className="w-full flex justify-center">
          <RadarChart outerRadius={60} width={220} height={160} data={radarData} className="w-full md:w-auto">
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
          </RadarChart>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 text-xs sm:text-sm justify-center">
          <div className="bg-green-200 text-green-800 px-2 py-1 rounded">
            Strength: Polity, History, Maths, Art & Culture
          </div>
          <div className="bg-red-200 text-red-800 px-2 py-1 rounded">
            Weakness: Polity, History, Maths, Art & Culture
          </div>
        </div>
      </div>

      {/* 3. Bar Graph - Series 1 */}
      <div className="bg-white rounded-lg p-4 shadow">
        <p className="text-center font-semibold mb-2">Last 5 Prelims Tests Series</p>
        <BarChart width={330} height={200} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score1" fill="#f59e0b" />
          <Bar dataKey="score2" fill="#3b82f6" />
          <Bar dataKey="score3" fill="#10b981" />
        </BarChart>
      </div>

      {/* 4. Bar Graph - Series 2 */}
      <div className="bg-white rounded-lg p-4 shadow">
        <p className="text-center font-semibold mb-2">Last 5 Prelims Tests Series</p>
        <BarChart width={330} height={200} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score1" fill="#f59e0b" />
          <Bar dataKey="score2" fill="#3b82f6" />
          <Bar dataKey="score3" fill="#10b981" />
        </BarChart>
      </div>
      </div>
    </div>
  );
}
