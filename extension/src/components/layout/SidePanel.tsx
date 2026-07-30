import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { OperatorExplorer } from '@/components/explorer/OperatorExplorer';
import { SearchBuilder } from '@/components/builder/SearchBuilder';
import { Templates } from '@/components/templates/Templates';
import { History } from '@/components/history/History';
import { Settings } from '@/components/settings/Settings';
import { useState } from 'react';

type Tab = 'explorer' | 'builder' | 'templates' | 'history' | 'settings';

export function SidePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('explorer');

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {activeTab === 'explorer' && <OperatorExplorer />}
        {activeTab === 'builder' && <SearchBuilder />}
        {activeTab === 'templates' && <Templates />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}