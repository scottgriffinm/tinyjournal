import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const EntryHistoryChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-neutral-300 font-mono">No data available</h3>
      </div>
    );
  }

  // Convert each date string (YYYY-MM-DD) to a numeric timestamp
  const chartData = data.map((item) => ({
    ...item,
    dateValue: new Date(item.date).getTime(),
  }));

  // Determine the min/max timestamps for X-axis domain
  const dateValues = chartData.map((d) => d.dateValue);
  const minDate = Math.min(...dateValues);
  const maxDate = Math.max(...dateValues);

  // Get the first day of the month before minDate and after maxDate
  const getAdjustedBounds = (date, adjustMonth) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(1); // Set to the 1st of the current month
    adjustedDate.setMonth(adjustedDate.getMonth() + adjustMonth); // Adjust month
    adjustedDate.setHours(0, 0, 0, 0); // Reset time to start of the day
    return adjustedDate.getTime();
  };

  const adjustedMinDate = getAdjustedBounds(minDate, -1); // First of month before minDate
  const adjustedMaxDate = getAdjustedBounds(maxDate, 1); // First of month after maxDate

  // Build an array of ticks for the 1st day of each month between adjustedMinDate & adjustedMaxDate
  const getMonthTicks = (start, end) => {
    const ticks = [];
    const current = new Date(start);
    const last = new Date(end);

    while (current.getTime() <= last.getTime()) {
      ticks.push(current.getTime());
      current.setMonth(current.getMonth() + 1); // Increment by 1 month
    }
    return ticks;
  };

  const monthTicks = getMonthTicks(adjustedMinDate, adjustedMaxDate);

  // Format the X-axis labels to "mmm yy"
  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    return date
      .toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
      .toLowerCase();
  };

  // Y-axis configuration
  const yTicks = [4, 12, 20];
  const formatYAxis = (timeValue) => {
    if (timeValue === 4) return '4 am';
    if (timeValue === 12) return '12 pm';
    if (timeValue === 20) return '8 pm';
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#404040"
              horizontal={true}
              vertical={true} // Enable vertical gridlines for all ticks
            />
            <XAxis
              dataKey="dateValue"
              type="number"
              scale="time"
              domain={[adjustedMinDate, adjustedMaxDate]}
              ticks={monthTicks}
              tickFormatter={formatXAxis}
              stroke="#737373"
            />
            <YAxis
              dataKey="timeValue"
              type="number"
              stroke="#737373"
              tickFormatter={formatYAxis}
              domain={[0, 24]}
              ticks={yTicks}
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