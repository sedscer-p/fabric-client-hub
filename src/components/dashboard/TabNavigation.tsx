import { FileText, CheckSquare, MessageCircle } from 'lucide-react';

export type TabType = 'summary' | 'actions' | 'ask';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'actions', label: 'Actions', icon: CheckSquare },
  { id: 'ask', label: 'Ask', icon: MessageCircle },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-border bg-card">
      <nav className="flex px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-button flex items-center gap-2 ${isActive ? 'tab-button-active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
