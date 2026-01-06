import { useState } from 'react';
import { Send, MessageSquare, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
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
      // In a real app, this would send the message to an API
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
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <Card className="shadow-card flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Ask about this client
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.length > 0 ? (
              messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Ask any question about this client's history, preferences, or previous discussions.
                </p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
