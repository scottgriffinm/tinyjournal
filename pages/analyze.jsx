import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowUp,
  ArrowLeft,
  BookText,
  TrendingUp,
  Sparkles,
  Rocket,
  Smile,
  Plus, // <--- Import Plus
} from 'lucide-react';

// "Bouncing dots" used for both waiting and typing:
const TypingAnimation = () => (
  <div className="flex space-x-1.5 px-4 py-3">
    <div
      className="w-2 h-2 bg-neutral-500 rounded-full animate-[bounce_1s_infinite]"
      style={{ animationDelay: '0s' }}
    />
    <div
      className="w-2 h-2 bg-neutral-500 rounded-full animate-[bounce_1s_infinite]"
      style={{ animationDelay: '0.2s' }}
    />
    <div
      className="w-2 h-2 bg-neutral-500 rounded-full animate-[bounce_1s_infinite]"
      style={{ animationDelay: '0.4s' }}
    />
  </div>
);

const SuggestionButton = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-6 bg-neutral-800/50 rounded-lg hover:bg-neutral-800
               transition-colors text-center space-y-3 border border-neutral-700"
  >
    <Icon className="w-6 h-6 text-neutral-400" />
    <span className="text-sm">{text}</span>
  </button>
);

const Analyze = () => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingMessage, setTypingMessage] = useState('');

  // State to show "bouncing dots" while we await the server
  const [isFetching, setIsFetching] = useState(false);

  // State to show the typewriter effect once we have the server's response
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const isFirstCharacter = useRef(true);

  // Quick suggestions
  const suggestions = [
    { icon: TrendingUp, text: 'Analyze trends in my journal' },
    { icon: Sparkles, text: 'Tell me something interesting about myself' },
    { icon: Rocket, text: 'Motivate me' },
    { icon: Smile, text: 'Give me advice on how to be happier' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  const typeMessage = async (fullText, delay = 30) => {
    setIsTyping(true);
    setTypingMessage('');
    isFirstCharacter.current = true;

    let displayedMessage = '';
    const chunkSize = 3;

    for (let i = 0; i < fullText.length; i += chunkSize) {
      displayedMessage = fullText.slice(0, i + chunkSize);
      setTypingMessage(displayedMessage);

      if (isFirstCharacter.current) {
        setTimeout(scrollToBottom, 50);
        isFirstCharacter.current = false;
      }

      await new Promise((resolve) =>
        requestAnimationFrame(() => {
          setTimeout(resolve, delay);
        })
      );
    }

    setIsTyping(false);
    setTypingMessage('');

    // Append final message to our messages array
    setMessages((prev) => [...prev, { type: 'bot', content: fullText }]);
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    // Step 1: Display user's message in the chat
    const userMessage = messageText.trim();
    setInput('');
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = '44px';
    }
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setTimeout(scrollToBottom, 50);

    // Step 2: Show "bouncing dots" while awaiting the server
    setIsFetching(true);

    // Step 3: Call /api/analyze to get AI response
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages, // the entire conversation so far
          userMessage, // the latest user message
        }),
      });

      if (!res.ok) {
        console.error('Failed to call /api/analyze:', await res.text());
        return;
      }

      const data = await res.json();
      if (data.aiResponse) {
        setIsFetching(false);
        await typeMessage(data.aiResponse);
      }
    } catch (error) {
      console.error('Error calling /api/analyze:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Clears the conversation, resetting state so suggestions reappear.
   */
  const handleNewConversation = () => {
    setMessages([]);
    setInput('');
    setTypingMessage('');
    setIsFetching(false);
    setIsTyping(false);
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono flex flex-col h-screen relative">
      {/* Container for both buttons */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        {/* Back Button */}
        <button
          className="hover:bg-neutral-800 p-2 rounded transition-colors bg-neutral-900"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* New Conversation Button (Plus Icon) */}
        <button
          className="hover:bg-neutral-800 p-2 rounded transition-colors bg-neutral-900"
          onClick={handleNewConversation}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: 'contain' }}>
        {/* If no messages, show suggestions */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center">
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
                className={`flex w-full ${
                  message.type === 'user' ? 'justify-end items-start' : 'justify-start items-start space-x-2'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="mt-2">
                    <BookText className="w-5 h-5 text-neutral-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] min-w-0 px-4 py-2 rounded break-words overflow-hidden ${
                    message.type === 'user'
                      ? 'bg-neutral-800/50'
                      : 'bg-neutral-800/30 border border-neutral-700'
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

        {/* Display "bouncing dots" if we are waiting for the server,
            or if we are currently typing out the final AI response. */}
        {(isFetching || isTyping) && (
          <div className="flex w-full justify-start items-start space-x-2">
            <div className="mt-2">
              <BookText className="w-5 h-5 text-neutral-500" />
            </div>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded">
              {isTyping && typingMessage ? (
                <pre className="whitespace-pre-wrap font-mono text-sm px-4 py-2">{typingMessage}</pre>
              ) : (
                <TypingAnimation />
              )}
            </div>
          </div>
        )}

        {/* Dummy ref to scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-800 p-4 bg-neutral-900">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your journal..."
            className="flex-1 bg-neutral-800/50 p-3 rounded resize-none focus:outline-none
                       min-h-[44px] max-h-32 overflow-y-auto border border-neutral-700"
            style={{ lineHeight: '20px', height: '44px', minHeight: '44px' }}
            onInput={(e) => {
              const textarea = e.target;
              textarea.style.height = '44px';
              textarea.style.height = `${Math.max(textarea.scrollHeight, 44)}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="bg-neutral-800/50 p-3 rounded hover:bg-neutral-800 transition-colors
                       disabled:opacity-50 disabled:hover:bg-neutral-800"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { getSession } = await import('next-auth/react');
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default Analyze;