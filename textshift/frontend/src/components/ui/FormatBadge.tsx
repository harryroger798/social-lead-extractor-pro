import { useState } from 'react';
import {
  FileText, 
  Code2, 
  FileCode, 
  FileJson, 
  FileType,
  Braces,
  Hash,
  ChevronDown,
  Wand2,
  X
} from 'lucide-react';
import { 
  DetectedFormat, 
  FormatDetectionResult, 
  getFormatDisplayName,
  stripAllFormatting,
  stripHtml,
  stripMarkdown
} from '@/lib/formatDetector';

interface FormatBadgeProps {
  detection: FormatDetectionResult;
  onStripFormatting?: (strippedText: string) => void;
  originalText: string;
}

const formatIcons: Record<DetectedFormat, any> = {
  'plain': FileText,
  'html': FileCode,
  'markdown': Hash,
  'rich-text': FileType,
  'code': Code2,
  'json': FileJson,
  'xml': Braces,
  'latex': FileText,
};

const formatColors: Record<DetectedFormat, string> = {
  'plain': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'html': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'markdown': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'rich-text': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'code': 'bg-green-500/20 text-green-400 border-green-500/30',
  'json': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'xml': 'bg-red-500/20 text-red-400 border-red-500/30',
  'latex': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export function FormatBadge({ detection, onStripFormatting, originalText }: FormatBadgeProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  const Icon = formatIcons[detection.format];
  const colorClass = formatColors[detection.format];
  
  if (!detection.hasFormatting) {
    return null;
  }

  const handleStripAll = () => {
    if (onStripFormatting) {
      const stripped = stripAllFormatting(originalText);
      onStripFormatting(stripped);
    }
    setShowOptions(false);
  };

  const handleStripHtml = () => {
    if (onStripFormatting) {
      const stripped = stripHtml(originalText);
      onStripFormatting(stripped);
    }
    setShowOptions(false);
  };

  const handleStripMarkdown = () => {
    if (onStripFormatting) {
      const stripped = stripMarkdown(originalText);
      onStripFormatting(stripped);
    }
    setShowOptions(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${colorClass} hover:opacity-80`}
      >
        <Icon className="w-3 h-3" />
        <span>{getFormatDisplayName(detection.format)} Detected</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </button>
      
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Format Options</span>
              <button onClick={() => setShowOptions(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{detection.details}</p>
            <p className="text-xs text-gray-600 mt-0.5">Confidence: {detection.confidence}%</p>
          </div>
          
          <div className="p-2 space-y-1">
            <button
              onClick={handleStripAll}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Wand2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-medium">Strip All Formatting</div>
                <div className="text-xs text-gray-500">Extract plain text only</div>
              </div>
            </button>
            
            {(detection.format === 'html' || detection.format === 'rich-text') && (
              <button
                onClick={handleStripHtml}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <FileCode className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="font-medium">Strip HTML Tags</div>
                  <div className="text-xs text-gray-500">Remove HTML, keep text structure</div>
                </div>
              </button>
            )}
            
            {detection.format === 'markdown' && (
              <button
                onClick={handleStripMarkdown}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Hash className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium">Strip Markdown</div>
                  <div className="text-xs text-gray-500">Remove markdown syntax</div>
                </div>
              </button>
            )}
            
            <button
              onClick={() => setShowOptions(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <div>
                <div className="font-medium">Keep As-Is</div>
                <div className="text-xs text-gray-500">Process with formatting included</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
