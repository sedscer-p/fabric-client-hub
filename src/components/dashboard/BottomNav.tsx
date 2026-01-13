import { Home, FileText, Mic, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'meeting-notes', label: 'Meeting Notes', icon: FileText },
    { id: 'start-meeting', label: 'Record', icon: Mic },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gold/20 shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                isActive
                  ? 'text-navy'
                  : 'text-muted-foreground hover:text-navy'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-gold' : ''}`}
                strokeWidth={1.5}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
