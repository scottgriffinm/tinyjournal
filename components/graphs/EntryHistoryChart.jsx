import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * Returns the UTC timestamp for the start of a given month, with an optional offset.
 * 
 * @param {number} timestamp - The timestamp representing the reference date.
 * @param {number} [monthOffset=0] - The number of months to offset (negative for past months, positive for future months).
 * @returns {number} - The UTC timestamp for the first day of the adjusted month at 00:00 UTC.
 */
function getStartOfMonthUTC(timestamp, monthOffset = 0) {
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

/**
 * Formats a UTC timestamp into a short month-year string (e.g., "1/25", "10/25").
 * 
 * @param {number} timestamp - The UTC timestamp to format.
 * @returns {string} - A formatted string representing the two-digit month and year.
 */
function formatXAxisUTC(timestamp) {
  var date = new Date(timestamp);
  date = date.toLocaleDateString(undefined, {
    month: '2-digit',
    year: '2-digit',
    timeZone: 'UTC'
  }).toLowerCase();
  if (date[0] === "0") {
    date = date.slice(1);
  }
  return date
}

/**
 * Formats a UTC timestamp into a full date-time string.
 * Example: "09/15/2025, 14:03:25"
 */
function formatTooltipDateTimeUTC(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    timeZone: 'UTC',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Set to true for AM/PM format
  });
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
  const chartData = data.map((item) => {
    // Extract hours, minutes, and seconds from timeValue (now a decimal)
    const hours = Math.floor(item.timeValue);
    const minutes = Math.floor((item.timeValue % 1) * 60);
    const seconds = Math.round(((item.timeValue * 60) % 1) * 60);
  
    return {
      ...item,
      dateValue: Date.UTC(
        parseInt(item.date.slice(0, 4)),    // Year
        parseInt(item.date.slice(5, 7)) - 1, // Month (0-based)
        parseInt(item.date.slice(8, 10)),   // Day
        hours, // Hours
        minutes, // Minutes
        seconds // Seconds
      )
    };
  });

  // Extract date range
  const dateValues = chartData.map((d) => d.dateValue);
  const minDate = Math.min(...dateValues);
  const maxDate = Math.max(...dateValues);

  // Shift domain to the first of the previous month and next month
  const adjustedMinDate = getStartOfMonthUTC(minDate, -1); 
  const adjustedMaxDate = getStartOfMonthUTC(maxDate, 1);

  // Generate ticks at the start of each month in UTC
  const monthTicks = generateMonthTicksUTC(adjustedMinDate, adjustedMaxDate);

  // Format Y-axis values
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
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { dateValue } = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: "#171717", border: "1px solid #333", padding: "8px", borderRadius: "4px", color: "#fff" }}>
                      <p style={{ color: "#737373", margin: 0 }}>
                        {formatTooltipDateTimeUTC(dateValue)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
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