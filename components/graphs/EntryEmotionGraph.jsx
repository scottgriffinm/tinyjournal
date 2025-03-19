import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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

/**
 * Generates an array of timestamps representing the start of each month in UTC, from `start` to `end`.
 * 
 * @param {number} start - The UTC timestamp representing the start of the range.
 * @param {number} end - The UTC timestamp representing the end of the range.
 * @returns {number[]} - An array of UTC timestamps, each representing the first day of a month.
 */
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
 * Processes raw emotion data, groups entries by date, and computes average scores.
 * 
 * @param {Array<Object>} data - The raw emotion data array.
 * @param {string} data[].date - The date string in "YYYY-MM-DD" format.
 * @param {number} data[].happiness - The happiness score for the date.
 * @param {number} data[].connection - The connection score for the date.
 * @param {number} data[].productivity - The productivity score for the date.
 * @returns {Array<Object>} - An array of objects, each representing a date with averaged emotion scores.
 * @returns {number} return[].dateValue - The UTC timestamp of the date.
 * @returns {number} return[].happiness - The averaged happiness score.
 * @returns {number} return[].connection - The averaged connection score.
 * @returns {number} return[].productivity - The averaged productivity score.
 */
function getAveragedDataByDate(data) {
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

  // Convert to timestamp-based array
  const averagedData = Object.keys(dailyTotals).map((date) => ({
    dateValue: Date.UTC(
      parseInt(date.slice(0, 4)),          // year
      parseInt(date.slice(5, 7)) - 1,      // month is 0-based
      parseInt(date.slice(8, 10))          // day
    ),
    happiness: dailyTotals[date].totalHappiness / dailyTotals[date].count,
    connection: dailyTotals[date].totalConnection / dailyTotals[date].count,
    productivity: dailyTotals[date].totalProductivity / dailyTotals[date].count,
  }));

  // Sort data chronologically
  averagedData.sort((a, b) => a.dateValue - b.dateValue);

  return averagedData;
}

const EntryEmotionGraph = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-neutral-300 font-mono">No data available</h3>
      </div>
    );
  }

  // Process data
  const averagedData = getAveragedDataByDate(data);

  // Extract date range
  const dateValues = averagedData.map((d) => d.dateValue);
  const minDate = Math.min(...dateValues);
  const maxDate = Math.max(...dateValues);

  // Shift domain to the first of the *previous* and *next* month
  const adjustedMinDate = getStartOfMonthUTC(minDate, -1);
  const adjustedMaxDate = getStartOfMonthUTC(maxDate, 1);

  // Generate monthly ticks at UTC month boundaries
  const monthTicks = generateMonthTicksUTC(adjustedMinDate, adjustedMaxDate);

  // Format Y-axis values
  const formatYAxis = (value) => value.toFixed(1);

  // State variables to track visibility
  const [showHappiness, setShowHappiness] = useState(true);
  const [showConnection, setShowConnection] = useState(true);
  const [showProductivity, setShowProductivity] = useState(true);
  // Toggle lines when labels are clicked
  const handleToggleHappiness = () => {
    setShowHappiness((prev) => !prev);
  };
  const handleToggleConnection = () => {
    setShowConnection((prev) => !prev);
  };
  const handleToggleProductivity = () => {
    setShowProductivity((prev) => !prev);
  };

  return (
    <div className="w-full bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      <div className="flex flex-col items-center mb-6">
        <div className="flex gap-6 items-center">
          {/* Each label is clickable, toggling its corresponding state */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleToggleHappiness}
          >
            {/* You could conditionally style it if it's hidden, for example by changing opacity */}
            <span
              style={{ color: showHappiness ? '#4ade80' : '#444444' }}
              className="text-sm"
            >
              Happiness
            </span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleToggleConnection}
          >
            <span
              style={{ color: showConnection ? '#60a5fa' : '#444444' }}
              className="text-sm"
            >
              Connection
            </span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleToggleProductivity}
          >
            <span
              style={{ color: showProductivity ? '#fbbf24' : '#444444' }}
              className="text-sm"
            >
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
              dataKey="dateValue"
              type="number"
              scale="time"
              domain={[adjustedMinDate, adjustedMaxDate]}
              ticks={monthTicks}
              tickFormatter={formatXAxisUTC}
              stroke="#737373"
            />
            <YAxis
              stroke="#737373"
              tickFormatter={formatYAxis}
              domain={[0, 1]}
              ticks={[0.2, 0.4, 0.6, 0.8, 1.0]}
            />
           {/* Conditionally render each line if it's visible */}
           {showHappiness && (
              <Line
                type="monotone"
                dataKey="happiness"
                stroke="#4ade80"
                strokeWidth={3}
                dot={false}
              />
            )}
            {showConnection && (
              <Line
                type="monotone"
                dataKey="connection"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={false}
              />
            )}
            {showProductivity && (
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#fbbf24"
                strokeWidth={3}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EntryEmotionGraph;