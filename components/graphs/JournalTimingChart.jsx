import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ZAxis,
  CartesianGrid
} from 'recharts';

const JournalTimingChart = () => {
  // Generate synthetic data for 6 months of entries
  const generateData = () => {
    const data = [];
    const startDate = new Date('2023-10-01');
    const endDate = new Date('2024-03-31');
    
    // Generate 30 random entries
    for (let i = 0; i < 30; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      // Now allowing for full 24-hour distribution
      const randomHour = Math.random() * 24;
      
      data.push({
        date: randomDate.toISOString().split('T')[0],
        timeValue: randomHour
      });
    }
    
    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = generateData();

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
      <div className="flex items-center mb-6">
        <h3 className="text-neutral-300 font-mono">entries</h3>
      </div>
      <div className="h-96">
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
              data={chartData} 
              fill="#d4d4d4"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default JournalTimingChart;


