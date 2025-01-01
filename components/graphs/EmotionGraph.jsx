import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const EmotionGraph = ({ data }) => {
  const sampleData = [
    { date: '2023-12-01', happiness: 0.65, connection: 0.45, productivity: 0.70 },
    { date: '2023-12-15', happiness: 0.72, connection: 0.58, productivity: 0.63 },
    { date: '2024-01-01', happiness: 0.78, connection: 0.62, productivity: 0.55 },
    { date: '2024-01-15', happiness: 0.82, connection: 0.75, productivity: 0.68 },
    { date: '2024-02-01', happiness: 0.75, connection: 0.80, productivity: 0.72 },
    { date: '2024-02-15', happiness: 0.85, connection: 0.73, productivity: 0.81 },
    { date: '2024-03-01', happiness: 0.88, connection: 0.77, productivity: 0.85 },
    { date: '2024-03-15', happiness: 0.84, connection: 0.82, productivity: 0.79 }
  ];

  const chartData = data || sampleData;

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).toLowerCase();
  };

  const formatYAxis = (value) => value.toFixed(1);

  return (
    <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-neutral-300 font-mono">emotions</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#4ade80' }} />
            <span style={{ color: '#4ade80' }} className="text-sm">happiness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#60a5fa' }} />
            <span style={{ color: '#60a5fa' }} className="text-sm">connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#fbbf24' }} />
            <span style={{ color: '#fbbf24' }} className="text-sm">productivity</span>
          </div>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="date" 
              stroke="#737373"
              tickFormatter={formatXAxis}
            />
            <YAxis
              stroke="#737373"
              tickFormatter={formatYAxis}
              domain={[0, 1]}
              ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
            />
            <Line
              type="monotone"
              dataKey="happiness"
              stroke="#4ade80"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="connection"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="productivity"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmotionGraph;

