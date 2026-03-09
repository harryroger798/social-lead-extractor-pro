import { useState } from 'react';
import { MapPinned, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { detectGBPStatus } from '@/lib/api';

export default function GBPDetector() {
  const [businessName, setBusinessName] = useState('');
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [hasHours, setHasHours] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const [hasPhotos, setHasPhotos] = useState(false);
  const [hasReviews, setHasReviews] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    status: string;
    confidence: string;
    breakdown: { signal: string; points: number; present: boolean }[];
    opportunity: string;
    pitch: string;
  } | null>(null);

  const handleDetect = async () => {
    if (!businessName.trim()) return;
    setLoading(true);
    try {
      const data = await detectGBPStatus({
        name: businessName,
        has_website: hasWebsite,
        has_phone: hasPhone,
        has_hours: hasHours,
        has_description: hasDescription,
        has_photos: hasPhotos,
        photo_count: hasPhotos ? 5 : 0,
        has_reviews: hasReviews,
        review_count: reviewCount,
      });
      setResult(data);
    } catch (err) {
      console.error('GBP detection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'claimed') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (status === 'likely_claimed') return <AlertCircle className="w-5 h-5 text-amber-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const statusColor = (status: string) => {
    if (status === 'claimed') return 'text-emerald-400';
    if (status === 'likely_claimed') return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MapPinned className="w-5 h-5 text-emerald-400" />
            </div>
            GBP Detection
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Detect if a Google Business Profile is claimed or unclaimed</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., Joe's Pizza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Business Signals</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Has Website', value: hasWebsite, set: setHasWebsite },
                { label: 'Has Phone', value: hasPhone, set: setHasPhone },
                { label: 'Has Hours', value: hasHours, set: setHasHours },
                { label: 'Has Description', value: hasDescription, set: setHasDescription },
                { label: 'Has Photos (5+)', value: hasPhotos, set: setHasPhotos },
                { label: 'Has Reviews', value: hasReviews, set: setHasReviews },
              ].map((signal) => (
                <label key={signal.label} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signal.value}
                    onChange={(e) => signal.set(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-text-primary">{signal.label}</span>
                </label>
              ))}
            </div>
          </div>

          {hasReviews && (
            <div>
              <label className="block text-sm font-medium text-text-primary pb-3">Review Count</label>
              <input
                type="number"
                value={reviewCount}
                onChange={(e) => setReviewCount(Number(e.target.value))}
                min={0}
                className="w-32 px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          )}

          <button
            onClick={handleDetect}
            disabled={loading || !businessName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><MapPinned className="w-4 h-4" /> Detect GBP Status</>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">Detection Result</h3>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-bg-input border border-border">
                {statusIcon(result.status)}
                <div>
                  <p className={`text-lg font-bold ${statusColor(result.status)}`}>
                    {result.status.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-text-muted">Confidence: {result.confidence}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-accent">{result.score}</p>
                  <p className="text-xs text-text-muted">/ 100</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Signal Breakdown</p>
                <div className="space-y-1.5">
                  {result.breakdown.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-bg-input">
                      <span className={b.present ? 'text-emerald-400' : 'text-text-muted'}>
                        {b.present ? '✓' : '✗'} {b.signal}
                      </span>
                      <span className={b.present ? 'text-emerald-400 font-medium' : 'text-text-muted'}>
                        {b.present ? `+${b.points}` : '0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                <p className="text-xs font-medium text-accent mb-1">Sales Pitch</p>
                <p className="text-xs text-text-muted">{result.pitch}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <MapPinned className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Enter business details to detect GBP status</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
