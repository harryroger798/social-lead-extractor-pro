import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  BarChart3,
  Download,
  RefreshCw,
  Share2,
  Columns
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scanApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as Diff from 'diff';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [compareScan, setCompareScan] = useState<any>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['scanHistory', page, filterType],
    queryFn: () => scanApi.getHistory(page, 10, filterType),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScanIcon = (scanType: string) => {
    switch (scanType) {
      case 'ai_detection': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'humanize': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'plagiarism': return <Search className="w-4 h-4 text-blue-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScanTypeName = (scanType: string) => {
    switch (scanType) {
      case 'ai_detection': return 'AI Detection';
      case 'humanize': return 'Humanize';
      case 'plagiarism': return 'Plagiarism';
      default: return scanType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getResultSummary = (scan: any) => {
    if (scan.scan_type === 'ai_detection' && scan.ai_probability !== undefined) return `${scan.ai_probability}% AI`;
    if (scan.scan_type === 'plagiarism' && scan.plagiarism_score !== undefined) return `${scan.plagiarism_score}% Match`;
    if (scan.scan_type === 'humanize' && scan.output_text) return 'Completed';
    return scan.status;
  };

  const getConfidenceLabel = (level: string) => {
    const labels: Record<string, string> = { very_high: 'Very High', high: 'High', medium: 'Medium', low: 'Low', very_low: 'Very Low' };
    return labels[level] || level || 'Unknown';
  };

  const getConfidenceColor = (level: string) => {
    const colors: Record<string, string> = { very_high: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-emerald-400', very_low: 'text-emerald-500' };
    return colors[level] || 'text-gray-400';
  };

  const getSentenceHighlightColor = (probability: number) => {
    if (probability > 70) return 'bg-rose-500/30 border-rose-500/50';
    if (probability > 40) return 'bg-yellow-500/30 border-yellow-500/50';
    return 'bg-emerald-500/30 border-emerald-500/50';
  };

  const getHeatMapColor = (probability: number) => {
    if (probability > 80) return 'bg-rose-600';
    if (probability > 60) return 'bg-rose-500';
    if (probability > 40) return 'bg-yellow-500';
    if (probability > 20) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  const exportToPDF = async () => {
    if (!reportRef.current || !selectedScan) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0a0a0a', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`textshift-report-${selectedScan.id}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
    setExporting(false);
  };

    const generateShareLink = () => {
      if (!selectedScan) return;
      const shareData = btoa(JSON.stringify({ id: selectedScan.id, type: selectedScan.scan_type, result: selectedScan.ai_probability || selectedScan.plagiarism_score }));
      const url = `${window.location.origin}/shared-report/${shareData}`;
      setShareUrl(url);
      navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    };

  const reAnalyze = (tool: string) => {
    if (!selectedScan) return;
    navigate('/dashboard', { state: { text: selectedScan.input_text, tool } });
  };

    const copyHighlightedSections = () => {
      if (!selectedScan) return;
      const results = selectedScan.results || {};
      const sentences = results.sentence_analysis || [];
      const highAISentences = sentences.filter((s: any) => s.ai_probability > 50).map((s: any) => s.text).join(' ');
      const textToCopy = highAISentences || selectedScan.input_text;
      navigator.clipboard.writeText(textToCopy);
      alert('Copied to clipboard!');
    };

  const renderWordDiff = (original: string, humanized: string) => {
    const diff = Diff.diffWords(original, humanized);
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h4 className="text-white font-medium mb-3">Word-Level Changes</h4>
        <div className="text-sm leading-relaxed max-h-60 overflow-y-auto">
          {diff.map((part, i) => (
            <span key={i} className={part.added ? 'bg-emerald-500/30 text-emerald-300' : part.removed ? 'bg-rose-500/30 text-rose-300 line-through' : 'text-gray-300'}>
              {part.value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderHeatMap = (scan: any) => {
    const results = scan.results || {};
    const sentences = results.sentence_analysis || [];
    if (sentences.length === 0) return null;
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-4">Heat Map Visualization</h3>
        <div className="flex flex-wrap gap-1">
          {sentences.map((s: any, i: number) => (
            <div key={i} className={`w-8 h-8 rounded ${getHeatMapColor(s.ai_probability)} flex items-center justify-center text-xs text-white font-medium cursor-pointer`} title={`"${s.text.substring(0, 50)}..." - ${s.ai_probability}% AI`}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600"></span> 80%+</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500"></span> 60-80%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500"></span> 40-60%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> 20-40%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600"></span> &lt;20%</span>
        </div>
      </div>
    );
  };

  const renderConfidenceGauge = (probability: number) => {
    const rotation = (probability / 100) * 180 - 90;
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-4 text-center">Confidence Meter</h3>
        <div className="relative w-40 h-20 mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-16 bg-white origin-bottom" style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}></div>
          <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="text-center mt-4">
          <span className={`text-2xl font-bold ${probability > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{probability}%</span>
          <p className="text-gray-500 text-sm">{probability > 50 ? 'Likely AI' : 'Likely Human'}</p>
        </div>
      </div>
    );
  };

  const renderWordCloud = (scan: any) => {
    const text = scan.input_text || '';
    const words = text.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
    const wordFreq: Record<string, number> = {};
    words.forEach((w: string) => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const maxFreq = sortedWords[0]?.[1] || 1;
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-4">Common Words</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {sortedWords.map(([word, freq], i) => {
            const size = 0.8 + (freq / maxFreq) * 0.8;
            return (
              <span key={i} className="px-2 py-1 bg-white/10 rounded text-gray-300 hover:bg-white/20 transition-colors" style={{ fontSize: `${size}rem` }}>
                {word}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const totalPages = historyData ? Math.ceil(historyData.total / 10) : 1;

  const renderComparisonMode = () => {
    if (!compareMode || !selectedScan) return null;
    const otherScans = historyData?.scans?.filter((s: any) => s.id !== selectedScan.id && s.scan_type === selectedScan.scan_type) || [];
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setCompareMode(false); setCompareScan(null); }}>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-medium text-white">Compare Scans</h2>
            <Button variant="ghost" size="sm" onClick={() => { setCompareMode(false); setCompareScan(null); }} className="text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></Button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 max-h-[calc(90vh-80px)] overflow-y-auto">
            <div className="bg-white/5 rounded-2xl p-4 border border-emerald-500/30">
              <h3 className="text-emerald-400 font-medium mb-2">Scan #{selectedScan.id}</h3>
              <p className="text-gray-500 text-sm mb-2">{formatDate(selectedScan.created_at)}</p>
              <div className="text-3xl font-light text-white mb-2">{selectedScan.ai_probability || selectedScan.plagiarism_score}%</div>
              <p className="text-gray-400 text-sm max-h-40 overflow-y-auto">{selectedScan.input_text?.substring(0, 500)}...</p>
            </div>
            {compareScan ? (
              <div className="bg-white/5 rounded-2xl p-4 border border-purple-500/30">
                <h3 className="text-purple-400 font-medium mb-2">Scan #{compareScan.id}</h3>
                <p className="text-gray-500 text-sm mb-2">{formatDate(compareScan.created_at)}</p>
                <div className="text-3xl font-light text-white mb-2">{compareScan.ai_probability || compareScan.plagiarism_score}%</div>
                <p className="text-gray-400 text-sm max-h-40 overflow-y-auto">{compareScan.input_text?.substring(0, 500)}...</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-4 border border-dashed border-white/20">
                <h3 className="text-gray-400 font-medium mb-4">Select a scan to compare</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {otherScans.map((scan: any) => (
                    <div key={scan.id} onClick={() => setCompareScan(scan)} className="p-2 bg-black/30 rounded-lg cursor-pointer hover:bg-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">Scan #{scan.id}</span>
                        <span className="text-gray-400 text-xs">{scan.ai_probability || scan.plagiarism_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    if (!selectedScan) return null;
    const results = selectedScan.results || {};

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedScan(null)}>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">{getScanIcon(selectedScan.scan_type)}</div>
              <div>
                <h2 className="text-xl font-medium text-white">{getScanTypeName(selectedScan.scan_type)} Report</h2>
                <p className="text-gray-500 text-sm">{formatDate(selectedScan.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={exportToPDF} disabled={exporting} className="text-gray-400 hover:text-white hover:bg-white/10" title="Export PDF"><Download className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={generateShareLink} className="text-gray-400 hover:text-white hover:bg-white/10" title="Share"><Share2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setCompareMode(true)} className="text-gray-400 hover:text-white hover:bg-white/10" title="Compare"><Columns className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedScan(null)} className="text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></Button>
            </div>
          </div>

          {shareUrl && (
            <div className="mx-4 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <span className="text-emerald-400 text-sm truncate flex-1">{shareUrl}</span>
              <Button variant="ghost" size="sm" onClick={() => setShareUrl(null)} className="text-emerald-400 hover:bg-emerald-500/20"><X className="w-4 h-4" /></Button>
            </div>
          )}

          <div ref={reportRef} className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {selectedScan.scan_type === 'ai_detection' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-emerald-400" /><span className="text-gray-400 text-sm">AI Probability</span></div>
                    <div className={`text-3xl font-light ${selectedScan.ai_probability > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedScan.ai_probability}%</div>
                    <Progress value={selectedScan.ai_probability} className="h-2 mt-2 bg-white/10" />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /><span className="text-gray-400 text-sm">Confidence</span></div>
                    <div className={`text-2xl font-light ${getConfidenceColor(selectedScan.confidence_level || results.confidence_level)}`}>{getConfidenceLabel(selectedScan.confidence_level || results.confidence_level)}</div>
                    <div className="text-gray-500 text-sm mt-1">Score: {results.confidence_score || 'N/A'}/10</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-blue-400" /><span className="text-gray-400 text-sm">Analysis</span></div>
                    <div className="text-lg text-white">{results.analysis?.word_count || selectedScan.input_text?.split(/\s+/).length} words</div>
                    <div className="text-gray-500 text-sm mt-1">Avg: {results.analysis?.avg_sentence_length?.toFixed(1) || 'N/A'} w/s</div>
                  </div>
                  {renderConfidenceGauge(selectedScan.ai_probability)}
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">Verdict</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${selectedScan.ai_probability > 50 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {selectedScan.ai_probability > 50 ? 'AI Generated' : 'Human Written'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{selectedScan.ai_probability > 80 ? 'Strong AI indicators detected.' : selectedScan.ai_probability > 50 ? 'Moderate AI indicators.' : selectedScan.ai_probability > 20 ? 'Primarily human-written.' : 'Strong human indicators.'}</p>
                </div>

                {renderHeatMap(selectedScan)}

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Highlighted Analysis</h3>
                    <Button variant="ghost" size="sm" onClick={copyHighlightedSections} className="text-gray-400 hover:text-white hover:bg-white/10 text-xs"><Copy className="w-3 h-3 mr-1" /> Copy AI Sections</Button>
                  </div>
                  <div className="flex gap-4 mb-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/50"></span> High AI (70%+)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/50"></span> Medium (40-70%)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/50"></span> Human-like (&lt;40%)</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {results.sentence_analysis?.length > 0 ? (
                      <div className="space-y-1">
                        {results.sentence_analysis.map((s: any, i: number) => (
                          <span key={i} className={`inline-block px-2 py-1 rounded border ${getSentenceHighlightColor(s.ai_probability)} mr-1 mb-1`}>
                            <span className="text-gray-200 text-sm">{s.text}</span>
                            <span className={`ml-2 text-xs font-medium ${s.ai_probability > 70 ? 'text-rose-400' : s.ai_probability > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>{s.ai_probability}%</span>
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-gray-300 text-sm">{selectedScan.input_text}</p>}
                  </div>
                </div>

                {results.sentence_analysis?.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-medium mb-4">Sentence Breakdown</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {results.sentence_analysis.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-black/30 rounded-lg">
                          <div className={`w-12 text-center px-2 py-1 rounded text-xs font-medium ${s.ai_probability > 70 ? 'bg-rose-500/20 text-rose-400' : s.ai_probability > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{s.ai_probability}%</div>
                          <p className="text-gray-300 text-sm flex-1 truncate">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {renderWordCloud(selectedScan)}

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => reAnalyze('humanize')} className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"><RefreshCw className="w-4 h-4 mr-2" /> Humanize This Text</Button>
                  <Button onClick={() => reAnalyze('plagiarism')} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"><RefreshCw className="w-4 h-4 mr-2" /> Check Plagiarism</Button>
                </div>
              </div>
            )}

            {selectedScan.scan_type === 'humanize' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl font-light text-white">{results.changes_made || 'N/A'}</div>
                    <div className="text-gray-500 text-sm">Words Changed</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl font-light text-white">{selectedScan.input_text?.split(/\s+/).length || 0}</div>
                    <div className="text-gray-500 text-sm">Original Words</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl font-light text-emerald-400">{selectedScan.output_text?.split(/\s+/).length || 0}</div>
                    <div className="text-gray-500 text-sm">New Words</div>
                  </div>
                </div>

                {renderWordDiff(selectedScan.input_text || '', selectedScan.output_text || '')}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">Original Text</h4>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedScan.input_text)} className="text-gray-400 hover:text-white hover:bg-white/10"><Copy className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedScan.input_text}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-emerald-400 font-medium">Humanized Text</h4>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedScan.output_text)} className="text-gray-400 hover:text-white hover:bg-white/10"><Copy className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedScan.output_text}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => reAnalyze('detect')} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"><RefreshCw className="w-4 h-4 mr-2" /> Check AI Score of Humanized</Button>
                  <Button onClick={() => copyToClipboard(selectedScan.output_text)} className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"><Copy className="w-4 h-4 mr-2" /> Copy Humanized Text</Button>
                </div>
              </div>
            )}

            {selectedScan.scan_type === 'plagiarism' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2"><Search className="w-4 h-4 text-blue-400" /><span className="text-gray-400 text-sm">Plagiarism</span></div>
                    <div className={`text-3xl font-light ${selectedScan.plagiarism_score > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedScan.plagiarism_score}%</div>
                    <Progress value={selectedScan.plagiarism_score} className="h-2 mt-2 bg-white/10" />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-gray-400 text-sm">Original</span></div>
                    <div className="text-3xl font-light text-emerald-400">{(100 - (selectedScan.plagiarism_score || 0)).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-yellow-400" /><span className="text-gray-400 text-sm">Sources</span></div>
                    <div className="text-3xl font-light text-white">{selectedScan.sources_found || results.sources_found || 0}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Risk Level</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${selectedScan.plagiarism_score > 50 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : selectedScan.plagiarism_score > 30 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {selectedScan.plagiarism_score > 50 ? 'High Risk' : selectedScan.plagiarism_score > 30 ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>

                {results.sources?.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-medium mb-4">Matched Sources</h3>
                    <div className="space-y-3">
                      {results.sources.map((source: any, i: number) => (
                        <div key={i} className="p-3 bg-black/30 rounded-xl border border-rose-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-medium">{source.title || `Source ${i + 1}`}</span>
                            <span className="text-rose-400 text-sm font-medium">{source.similarity_score}% match</span>
                          </div>
                          <p className="text-gray-400 text-xs bg-rose-500/10 p-2 rounded mb-2">{source.matched_text}</p>
                          {source.url && source.url !== 'internal_source' && (
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">{source.url}</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Analyzed Text</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedScan.input_text}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => reAnalyze('humanize')} className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"><RefreshCw className="w-4 h-4 mr-2" /> Humanize This Text</Button>
                  <Button onClick={() => reAnalyze('detect')} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"><RefreshCw className="w-4 h-4 mr-2" /> Check AI Detection</Button>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-500">
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
            <span className="font-semibold tracking-tight">TextShift</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button>
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
          <div className="flex gap-2 flex-wrap">
            <Button variant={filterType === undefined ? "default" : "ghost"} size="sm" onClick={() => setFilterType(undefined)} className={filterType === undefined ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white hover:bg-white/10"}>All</Button>
            <Button variant={filterType === 'ai_detection' ? "default" : "ghost"} size="sm" onClick={() => setFilterType('ai_detection')} className={filterType === 'ai_detection' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white hover:bg-white/10"}><Shield className="w-3 h-3 mr-1" />AI Detection</Button>
            <Button variant={filterType === 'humanize' ? "default" : "ghost"} size="sm" onClick={() => setFilterType('humanize')} className={filterType === 'humanize' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white hover:bg-white/10"}><Sparkles className="w-3 h-3 mr-1" />Humanize</Button>
            <Button variant={filterType === 'plagiarism' ? "default" : "ghost"} size="sm" onClick={() => setFilterType('plagiarism')} className={filterType === 'plagiarism' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-white hover:bg-white/10"}><Search className="w-3 h-3 mr-1" />Plagiarism</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div></div>
        ) : historyData?.scans?.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No scans yet</h3>
            <p className="text-gray-500 mt-2">Your scan history will appear here</p>
            <Link to="/dashboard"><Button className="mt-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">Start Scanning</Button></Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {historyData?.scans?.map((scan: any) => (
                <div key={scan.id} onClick={() => setSelectedScan(scan)} className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-4 hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-white/5 rounded-lg">{getScanIcon(scan.scan_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{getScanTypeName(scan.scan_type)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${scan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : scan.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{getResultSummary(scan)}</span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{scan.input_text?.substring(0, 100)}...</p>
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
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"><ChevronLeft className="w-4 h-4" />Previous</Button>
                <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50">Next<ChevronRight className="w-4 h-4" /></Button>
              </div>
            )}
          </>
        )}
      </div>

      {renderDetailedView()}
      {renderComparisonMode()}
    </div>
  );
}
