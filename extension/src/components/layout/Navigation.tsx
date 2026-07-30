import { Search, LayoutDashboard, FolderOpen, History, Settings, SearchCheck } from 'lucide-react';

type TabId = 'explorer' | 'builder' | 'templates' | 'history' | 'settings' | 'validator';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'explorer' as const, label: 'Explorer', icon: Search },
  { id: 'builder' as const, label: 'Builder', icon: LayoutDashboard },
  { id: 'templates' as const, label: 'Templates', icon: FolderOpen },
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
  { id: 'validator' as const, label: 'Validator', icon: SearchCheck },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex border-b bg-card">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            activeTab === tab.id
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}