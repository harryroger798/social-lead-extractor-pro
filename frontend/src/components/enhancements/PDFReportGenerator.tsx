import { useState } from 'react';
import { FileText, Download, Loader2, Palette } from 'lucide-react';
import { generatePDFReport } from '@/lib/api';
import { fetchHistory } from '@/lib/api';
import type { SessionItem } from '@/lib/api';

export default function PDFReportGenerator() {
  const [title, setTitle] = useState('SnapLeads Report');
  const [companyName, setCompanyName] = useState('SnapLeads');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const loadSessions = async () => {
    if (sessionsLoaded) return;
    try {
      const data = await fetchHistory();
      setSessions(data);
      setSessionsLoaded(true);
    } catch {
      // ignore
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const blob = await generatePDFReport({
        session_id: sessionId || undefined,
        title,
        company_name: companyName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'snapleads-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
          <FileText className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">PDF Report Generator</h2>
          <p className="text-sm text-text-muted">Generate branded PDF reports of your leads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-bg-card rounded-xl border border-border p-5 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent" />
            Report Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="My Lead Report"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Company Name (Branding)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="Your Agency Name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Session (optional)</label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onFocus={loadSessions}
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="">All Leads</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.total_leads} leads)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Download className="w-4 h-4" /> Generate PDF Report</>
            )}
          </button>
        </div>

        {/* Preview Info */}
        <div className="bg-bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Report Preview</h3>
          <div className="bg-white rounded-lg p-6 text-center space-y-3" style={{ color: '#333' }}>
            <div className="w-full h-3 rounded-full" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} />
            <h4 className="text-lg font-bold" style={{ color: primaryColor }}>{title}</h4>
            <p className="text-xs text-gray-500">by {companyName}</p>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Leads</span>
                <span className="font-semibold">---</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Emails Found</span>
                <span className="font-semibold">---</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Phones Found</span>
                <span className="font-semibold">---</span>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 pt-2">
              Generated by {companyName} via SnapLeads
            </div>
          </div>
          <p className="text-xs text-text-muted">
            The PDF will include a summary page, platform breakdown chart, and a detailed lead table
            with all contact information, scores, and verification status.
          </p>
        </div>
      </div>
    </div>
  );
}
