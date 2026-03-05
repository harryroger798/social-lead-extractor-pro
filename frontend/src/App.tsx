import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import NewExtraction from '@/components/extraction/NewExtraction';
import ResultsView from '@/components/results/ResultsView';
import History from '@/components/history/History';
import BlacklistManager from '@/components/blacklist/BlacklistManager';
import Settings from '@/components/settings/Settings';
import ResellerPanel from '@/components/reseller/ResellerPanel';
import type { Section } from '@/types';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'extraction':
        return <NewExtraction />;
      case 'results':
        return <ResultsView />;
      case 'history':
        return <History />;
      case 'blacklist':
        return <BlacklistManager />;
      case 'settings':
        return <Settings />;
      case 'reseller':
        return <ResellerPanel />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-primary">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-hidden">
        {renderSection()}
      </main>
    </div>
  );
}

export default App
