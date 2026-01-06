import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatHistory, ChatMessage } from '@/data/mockData';
import { format, parseISO } from 'date-fns';

interface AskTabProps {
  clientId: string;
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const formattedTime = format(parseISO(message.timestamp), 'h:mm a');

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary' : 'bg-secondary'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" strokeWidth={1.5} />
        )}
      </div>
      <div className={`max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className="caption-text mt-1 px-1">
          {formattedTime}
        </p>
      </div>
    </div>
  );
}

export function AskTab({ clientId }: AskTabProps) {
  const [inputValue, setInputValue] = useState('');
  const messages = chatHistory[clientId] || [];

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('Sending message:', inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-12 pb-12 h-full flex flex-col max-w-[800px]">
      <h2 className="section-header mb-4">Ask about this client</h2>
      
      <div className="flex-1 flex flex-col min-h-[400px] card-minimal">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-3">
                <Bot className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Ask any question about this client's history, preferences, or previous discussions.
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2 p-4 border-t border-border">
          <Input
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-10 text-sm bg-card border-border focus:ring-2 focus:ring-offset-0 focus:ring-accent-subtle focus:border-primary"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
