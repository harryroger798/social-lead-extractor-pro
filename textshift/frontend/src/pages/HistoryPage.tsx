import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Sparkles, 
  Search, 
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scanApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['scanHistory', page, filterType],
    queryFn: () => scanApi.getHistory(page, 10, filterType),
  });

  const getScanIcon = (scanType: string) => {
    switch (scanType) {
      case 'ai_detection':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'humanize':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'plagiarism':
        return <Search className="w-4 h-4 text-blue-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScanTypeName = (scanType: string) => {
    switch (scanType) {
      case 'ai_detection':
        return 'AI Detection';
      case 'humanize':
        return 'Humanize';
      case 'plagiarism':
        return 'Plagiarism';
      default:
        return scanType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultSummary = (scan: any) => {
    if (scan.scan_type === 'ai_detection' && scan.ai_probability !== undefined) {
      return `${scan.ai_probability}% AI`;
    }
    if (scan.scan_type === 'plagiarism' && scan.plagiarism_score !== undefined) {
      return `${scan.plagiarism_score}% Match`;
    }
    if (scan.scan_type === 'humanize' && scan.output_text) {
      return 'Completed';
    }
    return scan.status;
  };

  const totalPages = historyData ? Math.ceil(historyData.total / 10) : 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="font-semibold tracking-tight">TEXTSHIFT</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light text-white">Scan History</h1>
            <p className="text-gray-500 mt-1">View your past scans and results</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === undefined ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType(undefined)}
              className={filterType === undefined ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white"}
            >
              All
            </Button>
            <Button
              variant={filterType === 'ai_detection' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType('ai_detection')}
              className={filterType === 'ai_detection' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white"}
            >
              <Shield className="w-3 h-3 mr-1" />
              AI Detection
            </Button>
            <Button
              variant={filterType === 'humanize' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType('humanize')}
              className={filterType === 'humanize' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white"}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Humanize
            </Button>
            <Button
              variant={filterType === 'plagiarism' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType('plagiarism')}
              className={filterType === 'plagiarism' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-white"}
            >
              <Search className="w-3 h-3 mr-1" />
              Plagiarism
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        ) : historyData?.scans?.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No scans yet</h3>
            <p className="text-gray-500 mt-2">Your scan history will appear here</p>
            <Link to="/dashboard">
              <Button className="mt-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">
                Start Scanning
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {historyData?.scans?.map((scan: any) => (
                <div
                  key={scan.id}
                  className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-white/5 rounded-lg">
                        {getScanIcon(scan.scan_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {getScanTypeName(scan.scan_type)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            scan.status === 'completed' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : scan.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {getResultSummary(scan)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {scan.input_text?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(scan.created_at)}</span>
                          <span>{scan.credits_used} words used</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-gray-400 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
