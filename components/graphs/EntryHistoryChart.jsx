import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

function getStartOfMonthUTC(timestamp, monthOffset = 0) {
  // Convert the original timestamp to a “year, month” in UTC,
  // then reconstruct a date that is always the 1st at 00:00 UTC.
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return Date.UTC(year, month + monthOffset, 1, 0, 0, 0, 0); 
}

function generateMonthTicksUTC(start, end) {
  const ticks = [];
  let currentTime = start;

  while (currentTime <= end) {
    ticks.push(currentTime);
    // Move forward by 1 month in UTC
    const d = new Date(currentTime);
    d.setUTCMonth(d.getUTCMonth() + 1);
    currentTime = d.getTime();
  }

  return ticks;
}

function formatXAxisUTC(timestamp) {
  // Format using UTC so we never slip into the previous/next day
  const date = new Date(timestamp);
  // Example: “dec 24” or “jan 25”
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC'
  }).toLowerCase();
}

const EntryHistoryChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-neutral-300 font-mono">No data available</h3>
      </div>
    );
  }

  // Convert each date string to a numeric timestamp
  const chartData = data.map((item) => ({
    ...item,
    // If item.date is like "2025-01-01", parse in UTC so it doesn't shift
    dateValue: Date.UTC(
      parseInt(item.date.slice(0,4)),    // year
      parseInt(item.date.slice(5,7)) - 1, // month is 0-based
      parseInt(item.date.slice(8,10))    // day
    )
  }));

  // Determine min and max date values
  const dateValues = chartData.map((d) => d.dateValue);
  const minDate = Math.min(...dateValues);
  const maxDate = Math.max(...dateValues);

  // Shift domain to the first of the *previous* month and *next* month
  const adjustedMinDate = getStartOfMonthUTC(minDate, -1); 
  const adjustedMaxDate = getStartOfMonthUTC(maxDate, 1);

  // Generate ticks at the start of each month in UTC
  const monthTicks = generateMonthTicksUTC(adjustedMinDate, adjustedMaxDate);

  // Y-axis ticks example
  const yTicks = [4, 12, 20];
  const formatYAxis = (value) => {
    if (value === 4) return '4 am';
    if (value === 12) return '12 pm';
    if (value === 20) return '8 pm';
    return '';
  };

  return (
    <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      <div className="flex justify-center items-center mb-6">
        <h3 className="text-white font-mono text-sm">History</h3>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="dateValue"
              type="number"
              scale="time"
              domain={[adjustedMinDate, adjustedMaxDate]}
              ticks={monthTicks}
              tickFormatter={formatXAxisUTC}
              stroke="#737373"
            />
            <YAxis
              dataKey="timeValue"
              type="number"
              domain={[0, 24]}
              ticks={yTicks}
              tickFormatter={formatYAxis}
              stroke="#737373"
            />
            <Scatter
              data={chartData}
              x="dateValue"
              y="timeValue"
              fill="#d4d4d4"
              shape="circle"
              r={5}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EntryHistoryChart;