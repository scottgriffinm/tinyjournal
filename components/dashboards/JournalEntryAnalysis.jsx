import React from 'react';

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
    return (
      <div className="flex flex-col items-center space-y-3">
        {/* Container for the progress circle */}
        <div className="relative w-24 h-24">
          {/* SVG container for the circular progress */}
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background circle (static) */}
            <circle
              cx="48" 
              cy="48"
              r="40" 
              className="fill-none stroke-neutral-800" 
              strokeWidth="12"
            />
            {/* Progress circle (dynamic) */}
            <circle
              cx="48"
              cy="48"
              r="40"
              className={`fill-none ${color}`}
              strokeWidth="12" 
              strokeDasharray={251.33}
              strokeDashoffset={251.33 * (1 - value / 100)}
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Optional label displayed below the progress circle */}
        <span className="text-sm font-mono text-neutral-400">{label}</span>
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
      <div className="bg-neutral-900 p-6 rounded-lg space-y-8 font-mono">
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
                className="flex items-center space-x-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
              >
                <span className="text-neutral-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
  
      </div>
    );
  }