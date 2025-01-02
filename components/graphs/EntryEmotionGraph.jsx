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
 * A helper function to group by date and average emotion scores
 * @param {Array} data - The raw data array, e.g.
 *  [
 *    { date: '2025-01-01', happiness: 0.8, connection: 0.2, productivity: 0.1 },
 *    { date: '2025-01-01', happiness: 0.7, connection: 0.3, productivity: 0.5 },
 *    { date: '2025-01-02', happiness: 0.9, connection: 0.2, productivity: 0.8 },
 *    ...
 *  ]
 * @returns {Array} - An array of objects, each containing a unique date and
 * averaged emotion scores, e.g.
 *  [
 *    { date: '2025-01-01', happiness: 0.75, connection: 0.25, productivity: 0.3 },
 *    { date: '2025-01-02', happiness: 0.9, connection: 0.2, productivity: 0.8 },
 *    ...
 *  ]
 */
function getAveragedDataByDate(data) {
  // Use an object to group sums by date
  const dailyTotals = {};

  data.forEach((entry) => {
    const { date, happiness, connection, productivity } = entry;
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        totalHappiness: 0,
        totalConnection: 0,
        totalProductivity: 0,
        count: 0,
      };
    }
    dailyTotals[date].totalHappiness += happiness;
    dailyTotals[date].totalConnection += connection;
    dailyTotals[date].totalProductivity += productivity;
    dailyTotals[date].count += 1;
  });

  // Convert the grouped data into an array and average them
  const averagedData = Object.keys(dailyTotals).map((date) => {
    const {
      totalHappiness,
      totalConnection,
      totalProductivity,
      count,
    } = dailyTotals[date];

    return {
      date,
      happiness: totalHappiness / count,
      connection: totalConnection / count,
      productivity: totalProductivity / count,
    };
  });

  // Sort by date so the chart lines move chronologically
  averagedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return averagedData;
}

/**
 * EmotionGraph Component
 * @param {Array} data - Array of objects with structure:
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

  // Before plotting, group any duplicate dates and average their scores
  const averagedData = getAveragedDataByDate(data);

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
      .toLowerCase();
  };

  const formatYAxis = (value) => value.toFixed(1);

  return (
    <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      <div className="flex flex-col items-center mb-6">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span style={{ color: '#4ade80' }} className="text-sm">
              Happiness
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#60a5fa' }} className="text-sm">
              Connection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#fbbf24' }} className="text-sm">
              Productivity
            </span>
          </div>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={averagedData}
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