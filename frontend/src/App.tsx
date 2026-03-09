import { useState } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { LicenseProvider, useLicense } from '@/contexts/LicenseContext';
import LicenseActivation from '@/components/license/LicenseActivation';
import LicenseExpired from '@/components/license/LicenseExpired';
import ProGate from '@/components/license/ProGate';
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
import { Loader2 } from 'lucide-react';
import type { Section } from '@/types';

function AppContent() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resultsSessionFilter, setResultsSessionFilter] = useState<string | undefined>(undefined);
  const { isActivated, isExpired, isLoading } = useLicense();

  // Show loading while checking license
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm text-text-muted">Checking license...</p>
        </div>
      </div>
    );
  }

  // Show activation screen if not activated
  if (!isActivated) {
    return <LicenseActivation />;
  }

  // Show expired screen if license is expired
  if (isExpired) {
    return <LicenseExpired />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'extraction':
        return <NewExtraction />;
      case 'results':
        return <ResultsView initialSessionId={resultsSessionFilter} onClearSessionFilter={() => setResultsSessionFilter(undefined)} />;
      case 'history':
        return <History onViewSessionResults={(sessionId: string) => { setResultsSessionFilter(sessionId); setActiveSection('results'); }} />;
      case 'blacklist':
        return <BlacklistManager />;
      case 'settings':
        return <Settings />;
      case 'reseller':
        return <ResellerPanel />;
      case 'gmaps':
        return <ProGate featureName="Google Maps Extractor"><GoogleMapsExtractor /></ProGate>;
      case 'schedules':
        return <ProGate featureName="Scheduled Extractions"><ScheduledExtractions /></ProGate>;
      case 'outreach':
        return <ProGate featureName="Email Outreach"><EmailOutreach /></ProGate>;
      case 'crm':
        return <ProGate featureName="CRM Export"><CRMExport /></ProGate>;
      case 'telegram':
        return <ProGate featureName="Telegram Scraper"><TelegramScraper /></ProGate>;
      case 'whatsapp':
        return <ProGate featureName="WhatsApp Scraper"><WhatsAppScraper /></ProGate>;
      case 'email_finder':
        return <ProGate featureName="Website Email Finder"><EmailFinder /></ProGate>;
      case 'safety_guide':
        return <SafetyGuide />;
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
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-bg-primary">
        <div className="flex-1 min-h-0 mx-auto w-full max-w-[1280px] flex flex-col">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <LicenseProvider>
        <AppContent />
      </LicenseProvider>
    </ToastProvider>
  );
}

export default App
