import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ZAxis,
  CartesianGrid,
} from 'recharts';

/**
 * EntryHistoryChart Component
 * @param {Array} data - Array of objects representing the chart data. Each object should have the following structure:
 * [
 *   { date: 'YYYY-MM-DD', timeValue: number },
 *   ...
 * ]
 */
const EntryHistoryChart = ({ data }) => {
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

  const formatYAxis = (timeValue) => {
    if (timeValue === 4) return '4 am';
    if (timeValue === 12) return '12 pm';
    if (timeValue === 20) return '8 pm';
    return '';
  };

  return (
    <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      {/* Centered Legend */}
      <div className="flex justify-center items-center mb-4">
        <h3 className="text-white font-mono text-sm">Entries</h3>
      </div>
      {/* Chart Container */}
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="date"
              stroke="#737373"
              tickFormatter={formatXAxis}
            />
            <YAxis
              dataKey="timeValue"
              stroke="#737373"
              tickFormatter={formatYAxis}
              domain={[0, 24]}
              ticks={[4, 12, 20]}
            />
            <ZAxis range={[50, 50]} />
            <Scatter
              data={data}
              fill="#d4d4d4"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EntryHistoryChart;