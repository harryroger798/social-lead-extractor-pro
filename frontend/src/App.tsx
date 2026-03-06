import { useState } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import NewExtraction from '@/components/extraction/NewExtraction';
import ResultsView from '@/components/results/ResultsView';
import History from '@/components/history/History';
import BlacklistManager from '@/components/blacklist/BlacklistManager';
import Settings from '@/components/settings/Settings';
import ResellerPanel from '@/components/reseller/ResellerPanel';
import GoogleMapsExtractor from '@/components/enhancements/GoogleMapsExtractor';
import ScheduledExtractions from '@/components/enhancements/ScheduledExtractions';
import EmailOutreach from '@/components/enhancements/EmailOutreach';
import CRMExport from '@/components/enhancements/CRMExport';
import TelegramScraper from '@/components/enhancements/TelegramScraper';
import WhatsAppScraper from '@/components/enhancements/WhatsAppScraper';
import EmailFinder from '@/components/enhancements/EmailFinder';
import SafetyGuide from '@/components/enhancements/SafetyGuide';
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
      case 'gmaps':
        return <GoogleMapsExtractor />;
      case 'schedules':
        return <ScheduledExtractions />;
      case 'outreach':
        return <EmailOutreach />;
      case 'crm':
        return <CRMExport />;
      case 'telegram':
        return <TelegramScraper />;
      case 'whatsapp':
        return <WhatsAppScraper />;
      case 'email_finder':
        return <EmailFinder />;
      case 'safety_guide':
        return <SafetyGuide />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen w-full overflow-hidden bg-bg-primary">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-bg-primary">
          <div className="flex-1 min-h-0 mx-auto w-full max-w-[1280px] flex flex-col">
            {renderSection()}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App
