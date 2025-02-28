import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowUp,
  ArrowLeft,
  BookText,
  TrendingUp,
  Sparkles,
  Rocket,
  Smile,
  Plus,
} from 'lucide-react';

import EntryEmotionGraph from '../components/graphs/EntryEmotionGraph';
import EntryHistoryChart from '../components/graphs/EntryHistoryChart';

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

const parseTextFormatting = (text) => {
  // First handle bold (**text**)
  let formattedText = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // Then handle italic (*text*)
  formattedText = formattedText.replace(/\*(.+?)\*/g, '<i>$1</i>');
  // Replace leftover '*' with '-'
  formattedText = formattedText.replace(/\*/g, '-');
  return formattedText;
};

const Analyze = () => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingMessage, setTypingMessage] = useState('');

  // State to show "bouncing dots" while we await the server
  const [isFetching, setIsFetching] = useState(false);

  // State to show the typewriter effect once we have the server's response
  const [isTyping, setIsTyping] = useState(false);

  // Ref to manage aborting typing mid-way
  const typingAbortRef = useRef(false);

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

  /**
   * Type out the final text character by character, but
   * ABORT if typingAbortRef.current = true.
   */
  const typeMessage = async (fullText, delay = 20) => {
    // Reset the abort flag at the start
    typingAbortRef.current = false;

    const parsedText = parseTextFormatting(fullText);
    setIsTyping(true);
    setTypingMessage('');
    isFirstCharacter.current = true;

    let displayedMessage = '';
    let formattedMessage = '';
    const chunkSize = 3;

    for (let i = 0; i < fullText.length; i += chunkSize) {
      // Check if we should abort
      if (typingAbortRef.current) {
        // Stop typing immediately
        break;
      }

      displayedMessage = fullText.slice(0, i + chunkSize);
      formattedMessage = parseTextFormatting(displayedMessage);
      setTypingMessage(formattedMessage);

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

    // Once we're done (either typed everything OR got aborted),
    // finalize the partial text if we aborted, or full text if not
    const finalDisplayedText = typingAbortRef.current
      ? displayedMessage
      : fullText;

    const finalParsedHTML = parseTextFormatting(finalDisplayedText);

    setIsTyping(false);
    setTypingMessage('');

    // Return the final parsed HTML so we can insert it into messages
    return finalParsedHTML;
  };

  /**
   * Sends the user message to /api/analyze, gets AI response, and updates state
   */
  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    // If the bot is currently typing, abort the old typing
    // and finalize whatever partial text we had so far in messages
    if (isTyping) {
      typingAbortRef.current = true;

      // Finalize partial typed text
      const partial = typingMessage; // whatever was typed so far
      const finalParsedPartial = parseTextFormatting(partial);

      // Clear out the typing state
      setIsTyping(false);
      setTypingMessage('');

      // Append the partial typed message to the conversation
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: finalParsedPartial,
          emotionData: null,
          entryHistoryData: null,
        },
      ]);
    }

    // Now we add the new user message below the final partial
    const userMessage = messageText.trim();
    setInput('');
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = '44px';
    }
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setTimeout(scrollToBottom, 50);

    // Show "bouncing dots" while awaiting the server
    setIsFetching(true);

    // Call /api/analyze for this new user message
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
      setIsFetching(false);

      // Animate the returned AI text
      if (data.aiResponse) {
        const finalHTML = await typeMessage(data.aiResponse);
        // Only append if we weren't aborted mid-typing again
        if (!typingAbortRef.current) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              content: finalHTML,
              // If the server returned chart data, attach it directly
              emotionData: data.emotionData || null,
              entryHistoryData: data.entryHistoryData || null,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error calling /api/analyze:', error);
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * Handles Enter key submission
   */
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
    typingAbortRef.current = false; // reset abort flag
  };

  // Gather url query prompt
  useEffect(() => {
    const queryPrompt = router.query.prompt;
    // if url query prompt present immediately send
    if (queryPrompt) {
      const decodedPrompt = decodeURIComponent(queryPrompt);
      setInput(decodedPrompt);
      handleSend(decodedPrompt);
      // setTimeout(() => {
      //   handleSend(decodedPrompt);
      // }, 100);
    }
  }, [router.query]);

  return (
    <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono flex flex-col h-screen relative">
      {/* Container for back + new-convo buttons */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        {/* Back Button */}
        <button
          className="hover:bg-neutral-800 p-2 rounded transition-colors bg-neutral-900"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* New Conversation Button */}
        <button
          className="hover:bg-neutral-800 p-2 rounded transition-colors bg-neutral-900"
          onClick={handleNewConversation}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* If no messages yet, show suggestions */}
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
            {messages.map((message, index) => {
              if (message.type === 'user') {
                // user message bubble
                return (
                  <div
                    key={index}
                    className="flex w-full justify-end items-start"
                  >
                    <div
                      className="max-w-[80%] min-w-0 px-4 py-2 rounded break-words overflow-hidden
                                 bg-neutral-800/50"
                    >
                      <div
                        className="whitespace-pre-wrap font-mono text-sm break-words overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      ></div>
                    </div>
                  </div>
                );
              } else if (message.type === 'bot') {
                // AI message bubble
                return (
                  <div
                    key={index}
                    className="flex w-full justify-start items-start space-x-2"
                  >
                    <div className="mt-2">
                      <BookText className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="max-w-[80%] min-w-0">
                      {/* AI message bubble */}
                      <div
                        className="px-4 py-2 rounded break-words overflow-hidden
                                   bg-neutral-800/30 border border-neutral-700"
                      >
                        <div
                          className="whitespace-pre-wrap font-mono text-sm break-words overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      </div>
                      {/* Charts below the message bubble */}
                      <div className="mt-2 flex flex-wrap gap-4">
                        {message.emotionData && (
                          <div className="flex-1 min-w-[300px]">
                            <EntryEmotionGraph data={message.emotionData} />
                          </div>
                        )}
                        {message.entryHistoryData && (
                          <div className="flex-1 min-w-[300px]">
                            <EntryHistoryChart data={message.entryHistoryData} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else {
                // fallback for unknown message types
                return null;
              }
            })}
          </>
        )}

        {/* Display bouncing dots if waiting for server or actively typing */}
        {(isFetching || isTyping) && (
          <div className="flex w-full justify-start items-start space-x-2">
            <div className="mt-2">
              <BookText className="w-5 h-5 text-neutral-500" />
            </div>
            <div
              className={`${typingMessage
                  ? 'max-w-[80%] min-w-0 bg-neutral-800/30 border border-neutral-700 rounded px-4 py-2'
                  : 'bg-neutral-800/50 border border-neutral-700 rounded'
                }`}
            >
              {typingMessage ? (
                <div
                  className="whitespace-pre-wrap font-mono text-sm break-words overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: typingMessage }}
                ></div>
              ) : (
                <TypingAnimation />
              )}
            </div>
          </div>
        )}

        {/* Dummy ref for scrolling */}
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
              textarea.style.height = `${Math.max(
                textarea.scrollHeight,
                44
              )}px`;
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