import React from 'react';
import { useState, useEffect, useRef } from 'react';

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
  const circleRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 350);
    };
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const size = isSmallScreen ? 64 : 96;
  const radius = isSmallScreen ? 28 : 40;
  const strokeWidth = isSmallScreen ? 8 : 12;
  const circumference = 2 * Math.PI * radius;

  // Direct DOM manipulation for instant animation
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = circumference * (1 - value / 100);
    }
  }, [value, circumference]);

  return (
    <div className={`flex flex-col items-center ${isSmallScreen ? 'space-y-2' : 'space-y-3'}`}>
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-neutral-800"
            strokeWidth={strokeWidth}
          />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-none ${color}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out',
            }}
          />
        </svg>
      </div>
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
        <div className="flex justify-between items-center max-w-lg max-w-sm mx-auto ml-2">
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
                  className={`absolute top-0 left-0 w-20 h-20 transform rotate-45 translate-x-[-58px] translate-y-[-58px] z-0 
                    ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-orange-500' : 'bg-neutral-700'}
                    rounded-full`}
                ></div>
                <span className="relative z-10 text-neutral-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
  
      </div>
    );
  }