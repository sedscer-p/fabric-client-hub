import { useState } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AskBarProps {
  clientId: string;
}

export function AskBar({ clientId }: AskBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('Sending message for client:', clientId, inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <div className="border-b border-border bg-card">
        <div className="max-w-[800px] px-12 py-3">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-fast"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>Ask about this client...</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="max-w-[800px] px-12 py-3">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <Input
            placeholder="Ask any question about this client..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
            className="flex-1 h-9 text-sm bg-background border-border focus:ring-2 focus:ring-offset-0 focus:ring-accent-subtle focus:border-primary"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size="icon"
            className="h-9 w-9 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
          </Button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground hover:text-foreground transition-fast shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
