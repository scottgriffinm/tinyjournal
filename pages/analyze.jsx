import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { ArrowUp, ArrowLeft, BookText, TrendingUp, Sparkles, Rocket, Smile } from 'lucide-react';
const TypingAnimation = () => (
  <div className="flex space-x-1.5 px-4 py-3">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0s' }} />
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0.2s' }} />
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0.4s' }} />
  </div>
);

const SuggestionButton = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center space-y-3 border border-gray-700"
  >
    <Icon className="w-6 h-6 text-gray-400" />
    <span className="text-sm">{text}</span>
  </button>
);

const Analyze = () => {
    const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const isFirstCharacter = useRef(true);
  
  const suggestions = [
    { icon: TrendingUp, text: "Analyze trends in my journal", response: "I'll analyze the patterns and trends in your journal entries. What specific aspects would you like me to focus on?" },
    { icon: Sparkles, text: "Tell me something interesting about myself", response: "I'd be happy to explore your data and find interesting insights. What areas of your life would you like to learn more about?" },
    { icon: Rocket, text: "Motivate me", response: "Let's look at your progress and achievements to help motivate you. Would you like to focus on recent wins or set new goals?" },
    { icon: Smile, text: "Give me advice on how to be happier", response: "I can help identify patterns and suggest personalized strategies for increasing your happiness. Shall we start by looking at what activities correlate with your positive moments?" }
  ];
  
  const typeMessage = async (message, delay = 30) => {
    setIsTyping(true);
    setTypingMessage('');
    isFirstCharacter.current = true;
    
    let displayedMessage = '';
    const chunkSize = 3;
    
    for (let i = 0; i < message.length; i += chunkSize) {
      displayedMessage = message.slice(0, i + chunkSize);
      setTypingMessage(displayedMessage);
      
      if (isFirstCharacter.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 50);
        isFirstCharacter.current = false;
      }
      
      await new Promise(resolve => requestAnimationFrame(() => {
        setTimeout(resolve, delay);
      }));
    }
    
    setIsTyping(false);
    setTypingMessage('');
    setMessages(prev => [...prev, { type: 'bot', content: message }]);
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;
    
    const userMessage = messageText;
    setInput('');
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = '44px';
    }
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }, 50);
    
    // If the message matches a suggestion, use its response
    const suggestion = suggestions.find(s => s.text === messageText);
    const response = suggestion ? suggestion.response : "I can help analyze your trends, life statistics, and provide advice based on your data. What specifically would you like to know about?";
    await typeMessage(response);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300 font-mono flex flex-col h-screen relative">
      {/* Floating Back Button */}
     <button className="absolute top-4 left-4 hover:bg-gray-800 p-2 rounded transition-colors z-10 bg-gray-900" onClick={() => router.push("/")}>
        <ArrowLeft className="w-5 h-5" />
      </button>
   

      {/* Scrollable Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ overscrollBehavior: 'contain' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-center text-lg mb-8"></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
              {suggestions.map((suggestion, index) => (
                <SuggestionButton
                  key={index}
                  icon={suggestion.icon}
                  text={suggestion.text}
                  onClick={() => handleSend(suggestion.text)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex w-full ${message.type === 'user' ? 'justify-end items-start' : 'justify-start items-start space-x-2'}`}
              >
                {message.type === 'bot' && (
                  <div className="mt-2">
                    <BookText className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] min-w-0 px-4 py-2 rounded break-words overflow-hidden ${
                    message.type === 'user'
                      ? 'bg-gray-800'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-mono text-sm break-words overflow-hidden">
                    {message.content}
                  </pre>
                </div>
              </div>
            ))}
          </>
        )}
        {isTyping && (
          <div className="flex w-full justify-start items-start space-x-2">
            <div className="mt-2">
              <BookText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded">
              {typingMessage ? (
                <pre className="whitespace-pre-wrap font-mono text-sm px-4 py-2">
                  {typingMessage}
                </pre>
              ) : (
                <TypingAnimation />
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ask about your journal..."
            className="flex-1 bg-gray-800 p-3 rounded resize-none focus:outline-none min-h-[44px] max-h-32 overflow-y-auto"
            style={{ height: '44px' }}
            onInput={(e) => {
              e.target.style.height = '44px';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-gray-800"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analyze;