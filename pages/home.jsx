import React from "react";

const Home = () => {
  const feedItems = [
    {
      date: "12/3/24",
      content: "New job, moving",
      emoji: "😎",
    }
  ];

  return (
    <div className="bg-gray-900 p-6 min-h-screen text-gray-300 font-mono">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
       <h1 className="text-2xl mb-10">
         tiny journal
        </h1>

        {/* Menu Items */}
        <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-lg">new entry</span>
            </div>


            <div className="bg-gray-800 p-4 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-lg">analyze</span>
            </div>



            <div className="bg-gray-800 p-4 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-lg">account</span>
            </div>

        </div>

        {/* Feed Items */}
        <div className="space-y-2 mt-8">
          {feedItems.map((item, index) => (

            <div
              key={index}
              className="bg-gray-800 p-3 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{item.date}</span>
                <span>{item.content}</span>
              </div>
              <span className="text-xl">{item.emoji}</span>
            </div>
        
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
