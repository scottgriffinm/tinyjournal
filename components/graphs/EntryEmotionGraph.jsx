import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

/**
 * EmotionGraph Component
 * @param {Array} data - Array of objects representing the chart data. Each object should have the following structure:
 * [
 *   { date: 'YYYY-MM-DD', happiness: number, connection: number, productivity: number },
 *   ...
 * ]
 */
const EntryEmotionGraph = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-neutral-300 font-mono">No data available</h3>
      </div>
    );
  }

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).toLowerCase();
  };

  const formatYAxis = (value) => value.toFixed(1);

  return (
    <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-neutral-300 font-mono">Emotions</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#4ade80' }} />
            <span style={{ color: '#4ade80' }} className="text-sm">Happiness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#60a5fa' }} />
            <span style={{ color: '#60a5fa' }} className="text-sm">Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: '#fbbf24' }} />
            <span style={{ color: '#fbbf24' }} className="text-sm">Productivity</span>
          </div>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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

export default EntryEmotionGraph;