import React from 'react';
import { ArrowLeft } from 'lucide-react';

const EntryView = () => {
  // Mock data - would come from props or API
  const entry = {
    date: "12/3/24",
    content: "Today marks a significant change in my life. I accepted a new job offer and will be moving to a different city. It's both exciting and nerve-wracking to think about all the changes ahead. The company seems great, and the role aligns perfectly with where I want to take my career. Still, leaving behind friends and familiar places isn't easy. I'm trying to focus on the opportunities ahead rather than what I'm leaving behind."
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300 font-mono p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button and date */}
        <div className="flex justify-between items-center mb-8">
          <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer" />
          <span className="text-gray-500">{entry.date}</span>
        </div>

        {/* Entry content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {entry.content}
        </div>
      </div>
    </div>
  );
};

export default EntryView;