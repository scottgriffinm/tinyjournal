import React from 'react';
import { useState, useEffect } from 'react';

/**
 * CircularProgress Component
 * 
 * @param {Object} props - The component props
 * @param {number} props.value - The progress value (0-100) as a percentage
 * @param {string} props.color - Tailwind CSS class for the stroke color of the progress circle
 * @param {string} props.label - Optional label text displayed below the progress circle
 * 
 * @returns {JSX.Element} A circular progress indicator with a customizable label
 */
const CircularProgress = ({ value, color, label }) => {
  // State to track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Effect to track window size and update `isSmallScreen`
  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 350); // Small screen if width < 640px
    };
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Conditional values for small vs large screens
  const size = isSmallScreen ? 64 : 96; // Circle size
  const radius = isSmallScreen ? 28 : 40; // Circle radius
  const strokeWidth = isSmallScreen ? 8 : 12; // Stroke width
  const circumference = 2 * Math.PI * radius; // Circumference

  return (
    <div className={`flex flex-col items-center ${isSmallScreen ? 'space-y-2' : 'space-y-3'}`}>
      {/* Container for the progress circle */}
      <div style={{ width: size, height: size }} className="relative">
        {/* SVG container for the circular progress */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle (static) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-neutral-800"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle (dynamic) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-none ${color}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* Optional label displayed below the progress circle */}
      <span className={`${isSmallScreen ? 'text-xs' : 'text-sm'} font-mono text-neutral-400`}>
        {label}
      </span>
    </div>
  );
};

/**
 * JournalEntryAnalysis Component
 * 
 * @param {Object} props - The component props
 * @param {Object} props.data - The data object containing details for the journal entry
 * @param {Object} props.data.metrics - Object containing the progress metrics
 * @param {number} props.data.metrics.happiness - Happiness level (0-100)
 * @param {number} props.data.metrics.connection - Connection level (0-100)
 * @param {number} props.data.metrics.productivity - Productivity level (0-100)
 * @param {number} props.data.entryNumber - The journal entry number
 * @param {string} props.data.entryDatetime - The timestamp of the journal entry
 * @param {string} props.data.observation - Observation text related to the entry
 * @param {string} props.data.longSummary - Summary of the journal entry
 * @param {Array<string>} props.data.recommendations - List of recommendations
 * 
 * @returns {JSX.Element} A component displaying journal entry details, metrics, and recommendations
 */
export default function JournalEntryAnalysis({ data }) {
    // Destructure values from the passed data object
    const {
      metrics,
      entryNumber,
      entryDatetime,
      observation,
      longSummary,
      recommendations,
    } = data;
  
    return (
      <div className="bg-neutral-900 p-6 px-0 rounded-lg space-y-8 font-mono">
        {/* Entry Header */}
        <div className="space-y-1">
          {entryNumber && <h1 className="text-2xl text-neutral-300">Entry #{entryNumber}</h1>}
          <p className="text-lg text-neutral-400">{entryDatetime}</p>
          <p className="text-neutral-500 mt-2">{observation}</p>
        </div>
  
        {/* Metrics Section */}
        <div className="flex justify-between items-center max-w-lg md:max-w-sm mx-auto md:ml-2">
          <CircularProgress
            value={metrics.happiness}
            color="stroke-green-500"
            label="Happiness"
          />
          <CircularProgress
            value={metrics.connection}
            color="stroke-blue-500"
            label="Connection"
          />
          <CircularProgress
            value={metrics.productivity}
            color="stroke-orange-500"
            label="Productivity"
          />
        </div>
  
        {/* Summary Section */}
        <div className="space-y-2">
          <h3 className="text-lg text-neutral-300">Summary</h3>
          <p className="text-neutral-400 leading-relaxed">{longSummary}</p>
        </div>
        {/* Recommendations Section */}
        <div className="space-y-4">
          <h3 className="text-lg text-neutral-300">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="relative flex items-center p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors overflow-hidden"
              >
                {/* Rotated colored circle */}
                <div 
                  className={`absolute top-0 left-0 w-16 h-20 transform rotate-90 translate-x-[-45px] translate-y-[-45px] z-0 
                    ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-orange-500' : 'bg-neutral-700'}
                    rounded-full`}
                ></div>
                <span className="relative z-10 text-neutral-300 p-2">{rec}</span>
              </div>
            ))}
          </div>
        </div>
  
      </div>
    );
  }