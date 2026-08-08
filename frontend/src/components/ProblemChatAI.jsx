import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axiosClient from '../utils/axiosClient';


const ChatAI = ({ problem, code, language }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your AI coding tutor. Stuck on this problem? Ask me a question and I'll analyze your code to give you a hint!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userQuestion = inputValue.trim();
    
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
    setInputValue('');
    setIsLoading(true);
    try {
      const payload = {
        problemTitle: problem.title,
        problemDescription: problem.description, 
        userLanguage: language,
        userCode: code,
        userQuestion: userQuestion
      };

      const { data } = await axiosClient.post('/chatAI/doubt', payload);

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I encountered an error connecting to the server. Please check your connection and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-300">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-primary' : 'bg-secondary'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-primary-content" /> : <Bot className="w-5 h-5 text-secondary-content" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-content rounded-tr-none' 
                : 'bg-base-200 border border-base-content/10 text-base-content rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-base-300 prose-pre:border prose-pre:border-base-content/20 max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary-content" />
            </div>
            <div className="bg-base-200 border border-base-content/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-base-content/50 animate-spin" />
              <span className="text-sm text-base-content/50">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-base-200 border-t border-base-content/10 shrink-0">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={"Ask any doubt?"}
            disabled={isLoading}
            className="w-full bg-base-100 border border-base-content/20 text-base-content text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-secondary hover:bg-secondary/80 text-secondary-content rounded-full transition-colors disabled:bg-base-300 disabled:text-base-content/50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-base-content/50 mt-2">
          AI can make mistakes. Do not share sensitive information.
        </p>
      </div>

    </div>
  );
};

export default ChatAI;