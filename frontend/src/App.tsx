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
import PDFReportGenerator from '@/components/enhancements/PDFReportGenerator';
import DirectoryScraper from '@/components/enhancements/DirectoryScraper';
import AIEmailWriter from '@/components/enhancements/AIEmailWriter';
import LeadEnrichmentTool from '@/components/enhancements/LeadEnrichmentTool';
import GBPDetector from '@/components/enhancements/GBPDetector';
import CitationChecker from '@/components/enhancements/CitationChecker';
import ServiceSuggestions from '@/components/enhancements/ServiceSuggestions';
import SMTPChecker from '@/components/enhancements/SMTPChecker';
import JobBoardScraper from '@/components/enhancements/JobBoardScraper';
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
      case 'pdf_reports':
        return <ProGate featureName="PDF Reports"><PDFReportGenerator /></ProGate>;
      case 'directories':
        return <ProGate featureName="Directory Scraper"><DirectoryScraper /></ProGate>;
      case 'ai_email':
        return <ProGate featureName="AI Email Writer"><AIEmailWriter /></ProGate>;
      case 'lead_enrichment':
        return <ProGate featureName="Lead Enrichment"><LeadEnrichmentTool /></ProGate>;
      case 'gbp_detection':
        return <ProGate featureName="GBP Detection"><GBPDetector /></ProGate>;
      case 'citation_checker':
        return <ProGate featureName="Citation Checker"><CitationChecker /></ProGate>;
      case 'service_suggestions':
        return <ProGate featureName="Service Suggestions"><ServiceSuggestions /></ProGate>;
      case 'smtp_checker':
        return <ProGate featureName="SMTP Checker"><SMTPChecker /></ProGate>;
      case 'job_boards':
        return <ProGate featureName="Job Board Scraper"><JobBoardScraper /></ProGate>;
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
        <div className="flex-1 min-h-0 w-full flex flex-col">
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
