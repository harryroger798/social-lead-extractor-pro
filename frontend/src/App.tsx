import { useState, useEffect, useRef, useCallback } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { LicenseProvider, useLicense } from '@/contexts/LicenseContext';
import LicenseActivation from '@/components/license/LicenseActivation';
import LicenseExpired from '@/components/license/LicenseExpired';
import { isBackendReady, waitForBackend } from '@/lib/api';
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
import AccountProfile from '@/components/account/AccountProfile';
import TeamDashboard from '@/components/team/TeamDashboard';
import UsageStats from '@/components/usage/UsageStats';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Section } from '@/types';

function AppContent() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resultsSessionFilter, setResultsSessionFilter] = useState<string | undefined>(undefined);
  const { isActivated, isExpired, isLoading } = useLicense();
  // v3.5.34: Backend startup splash state
  const [backendStarting, setBackendStarting] = useState(!isBackendReady());
  // v3.5.76: Track startup failure so we can show retry UI instead of infinite spinner
  const [backendFailed, setBackendFailed] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  // v3.5.73: Elapsed time counter for splash screen
  const [splashElapsed, setSplashElapsed] = useState(0);
  const splashTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // v3.5.76: Extract startup logic into a function so it can be retried
  const attemptBackendConnect = useCallback(() => {
    setBackendFailed(false);
    setBackendError(null);
    const start = Date.now();
    if (splashTimerRef.current) clearInterval(splashTimerRef.current);
    setSplashElapsed(0);
    splashTimerRef.current = setInterval(() => {
      setSplashElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    waitForBackend()
      .then(() => {
        if (splashTimerRef.current) clearInterval(splashTimerRef.current);
        setBackendStarting(false);
      })
      .catch((err: Error) => {
        // v3.5.76: Show actionable error instead of infinite spinner
        if (splashTimerRef.current) clearInterval(splashTimerRef.current);
        setBackendFailed(true);
        setBackendError(err.message || 'Backend failed to start');
      });
  }, []);

  useEffect(() => {
    if (!isBackendReady()) {
      attemptBackendConnect();
    }
    return () => { if (splashTimerRef.current) clearInterval(splashTimerRef.current); };
  }, [attemptBackendConnect]);

  // v3.5.34: Show "Starting backend..." splash instead of broken UI
  // v3.5.73: Enhanced with elapsed time so user knows it's not frozen
  // v3.5.76: Shows error with retry button when backend fails to start
  if (backendStarting) {
    return (
      <div className="h-screen w-full bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {backendFailed ? (
            <>
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <p className="text-sm text-text-primary font-medium">Backend failed to start</p>
              <p className="text-xs text-text-muted text-center max-w-sm">
                {backendError || 'Could not connect to the backend engine.'}
              </p>
              <p className="text-xs text-text-muted/60 text-center max-w-sm">
                This can happen if antivirus is blocking SnapLeads, another app is using port 8000, or the first launch is still unpacking files.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => attemptBackendConnect()}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Connection
                </button>
                <button
                  onClick={() => setBackendStarting(false)}
                  className="px-4 py-2 border border-border-primary text-text-muted rounded-lg text-sm hover:bg-bg-secondary transition-colors"
                >
                  Continue Anyway
                </button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-sm text-text-muted">Starting backend...</p>
              {splashElapsed > 0 && (
                <p className="text-xs text-text-muted tabular-nums">
                  {splashElapsed >= 60
                    ? `${Math.floor(splashElapsed / 60)}m ${splashElapsed % 60}s elapsed`
                    : `${splashElapsed}s elapsed`}
                </p>
              )}
              <p className="text-xs text-text-muted/60">
                {splashElapsed >= 30
                  ? 'Loading modules for the first time — almost ready...'
                  : 'This may take a few seconds on first launch'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

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
      case 'account':
        return <AccountProfile />;
      case 'team':
        return <TeamDashboard />;
      case 'usage':
        return <UsageStats />;
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
