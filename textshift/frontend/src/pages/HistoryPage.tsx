import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Sparkles, 
  Search, 
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  CheckCircle,
  AlertTriangle,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scanApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceLabel = (level: string) => {
    switch (level) {
      case 'very_high': return 'Very High';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      case 'very_low': return 'Very Low';
      default: return level || 'Unknown';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-emerald-400';
      case 'very_low': return 'text-emerald-500';
      default: return 'text-gray-400';
    }
  };

  const getSentenceHighlightColor = (probability: number) => {
    if (probability > 70) return 'bg-rose-500/30 border-rose-500/50';
    if (probability > 40) return 'bg-yellow-500/30 border-yellow-500/50';
    return 'bg-emerald-500/30 border-emerald-500/50';
  };

  const renderHighlightedText = (scan: any) => {
    const results = scan.results || {};
    const sentences = results.sentence_analysis || [];
    
    if (sentences.length === 0) {
      return <p className="text-gray-300 whitespace-pre-wrap">{scan.input_text}</p>;
    }

    return (
      <div className="space-y-2">
        {sentences.map((sentence: any, index: number) => (
          <span
            key={index}
            className={`inline-block px-2 py-1 rounded border ${getSentenceHighlightColor(sentence.ai_probability)} mr-1 mb-1`}
            title={`${sentence.ai_probability}% AI probability`}
          >
            <span className="text-gray-200 text-sm">{sentence.text}</span>
            <span className={`ml-2 text-xs font-medium ${
              sentence.ai_probability > 70 ? 'text-rose-400' : 
              sentence.ai_probability > 40 ? 'text-yellow-400' : 'text-emerald-400'
            }`}>
              {sentence.ai_probability}%
            </span>
          </span>
        ))}
      </div>
    );
  };

  const renderDiffComparison = (original: string, humanized: string) => {
    const originalWords = original.split(/\s+/);
    const humanizedWords = humanized.split(/\s+/);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Original Text</h4>
            <span className="text-gray-500 text-xs">{originalWords.length} words</span>
          </div>
          <p className="text-gray-400 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {original}
          </p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-emerald-400 font-medium">Humanized Text</h4>
            <span className="text-gray-500 text-xs">{humanizedWords.length} words</span>
          </div>
          <p className="text-gray-200 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {humanized}
          </p>
        </div>
      </div>
    );
  };

  const totalPages = historyData ? Math.ceil(historyData.total / 10) : 1;

  const renderDetailedView = () => {
    if (!selectedScan) return null;
    const results = selectedScan.results || {};

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedScan(null)}>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                {getScanIcon(selectedScan.scan_type)}
              </div>
              <div>
                <h2 className="text-xl font-medium text-white">{getScanTypeName(selectedScan.scan_type)} Report</h2>
                <p className="text-gray-500 text-sm">{formatDate(selectedScan.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedScan.input_text)} className="text-gray-400 hover:text-white">
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedScan(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {selectedScan.scan_type === 'ai_detection' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-400 text-sm">AI Probability</span>
                    </div>
                    <div className={`text-3xl font-light ${selectedScan.ai_probability > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedScan.ai_probability}%
                    </div>
                    <Progress value={selectedScan.ai_probability} className="h-2 mt-2 bg-white/10" />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Confidence</span>
                    </div>
                    <div className={`text-2xl font-light ${getConfidenceColor(selectedScan.confidence_level || results.confidence_level)}`}>
                      {getConfidenceLabel(selectedScan.confidence_level || results.confidence_level)}
                    </div>
                    <div className="text-gray-500 text-sm mt-1">Score: {results.confidence_score || 'N/A'}/10</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Analysis</span>
                    </div>
                    <div className="text-lg text-white">{results.analysis?.word_count || selectedScan.input_text?.split(/\s+/).length} words</div>
                    <div className="text-gray-500 text-sm mt-1">Avg: {results.analysis?.avg_sentence_length?.toFixed(1) || 'N/A'} words/sentence</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">Verdict</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${selectedScan.ai_probability > 50 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {selectedScan.ai_probability > 50 ? 'AI Generated' : 'Human Written'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {selectedScan.ai_probability > 80 ? 'This text shows strong indicators of being generated by AI.' :
                     selectedScan.ai_probability > 50 ? 'This text shows moderate indicators of AI generation.' :
                     selectedScan.ai_probability > 20 ? 'This text appears primarily human-written with minor AI patterns.' :
                     'This text shows strong indicators of being human-written.'}
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Highlighted Analysis</h3>
                  <div className="flex gap-4 mb-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/50"></span> High AI (70%+)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/50"></span> Medium (40-70%)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/50"></span> Human-like (&lt;40%)</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {renderHighlightedText(selectedScan)}
                  </div>
                </div>

                {results.sentence_analysis && results.sentence_analysis.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-medium mb-4">Sentence Breakdown</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {results.sentence_analysis.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-black/30 rounded-lg">
                          <div className={`w-12 text-center px-2 py-1 rounded text-xs font-medium ${s.ai_probability > 70 ? 'bg-rose-500/20 text-rose-400' : s.ai_probability > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {s.ai_probability}%
                          </div>
                          <p className="text-gray-300 text-sm flex-1 truncate">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedScan.scan_type === 'humanize' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl font-light text-white">{results.changes_made || 'N/A'}</div>
                    <div className="text-gray-500 text-sm">Words Changed</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl font-light text-white">{results.original_length || selectedScan.input_text?.length}</div>
                    <div className="text-gray-500 text-sm">Original Length</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl font-light text-emerald-400">{results.humanized_length || selectedScan.output_text?.length}</div>
                    <div className="text-gray-500 text-sm">New Length</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Side-by-Side Comparison</h3>
                  {renderDiffComparison(selectedScan.input_text || '', selectedScan.output_text || '')}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(selectedScan.output_text)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30">
                    <Copy className="w-4 h-4 mr-2" /> Copy Humanized Text
                  </Button>
                </div>
              </div>
            )}

            {selectedScan.scan_type === 'plagiarism' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Plagiarism</span>
                    </div>
                    <div className={`text-3xl font-light ${selectedScan.plagiarism_score > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedScan.plagiarism_score}%
                    </div>
                    <Progress value={selectedScan.plagiarism_score} className="h-2 mt-2 bg-white/10" />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-400 text-sm">Original</span>
                    </div>
                    <div className="text-3xl font-light text-emerald-400">{(100 - (selectedScan.plagiarism_score || 0)).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Sources</span>
                    </div>
                    <div className="text-3xl font-light text-white">{selectedScan.sources_found || results.sources_found || 0}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Risk Level</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedScan.plagiarism_score > 50 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    selectedScan.plagiarism_score > 30 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {selectedScan.plagiarism_score > 50 ? 'High Risk' : selectedScan.plagiarism_score > 30 ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>

                {results.sources && results.sources.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-medium mb-4">Matched Sources</h3>
                    <div className="space-y-3">
                      {results.sources.map((source: any, i: number) => (
                        <div key={i} className="p-3 bg-black/30 rounded-xl border border-rose-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-medium">{source.title || `Source ${i + 1}`}</span>
                            <span className="text-rose-400 text-sm font-medium">{source.similarity_score}% match</span>
                          </div>
                          <p className="text-gray-400 text-xs bg-rose-500/10 p-2 rounded">{source.matched_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Analyzed Text</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedScan.input_text}</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-500">
              <span>Scan ID: #{selectedScan.id}</span>
              <span>{selectedScan.credits_used} words used</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                  onClick={() => setSelectedScan(scan)}
                  className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-4 hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all cursor-pointer"
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
                          <span className="text-emerald-400">Click for details</span>
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

      {renderDetailedView()}
    </div>
  );
}
