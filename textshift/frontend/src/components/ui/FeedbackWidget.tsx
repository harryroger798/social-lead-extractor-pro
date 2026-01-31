import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface FeedbackWidgetProps {
  scanId: number;
  scanType: 'ai_detection' | 'humanize' | 'plagiarism';
  modelPrediction?: string;
  modelConfidence?: number;
  onFeedbackSubmitted?: () => void;
}

type FeedbackType = 'good_result' | 'incorrect_prediction' | 'false_positive' | 'false_negative' | 'poor_quality';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function FeedbackWidget({
  scanId,
  scanType,
  modelPrediction,
  modelConfidence,
  onFeedbackSubmitted
}: FeedbackWidgetProps) {
  const { token, isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [isCorrect] = useState<boolean | null>(null);
  const [correctLabel, setCorrectLabel] = useState('');
  const [confidenceRating, setConfidenceRating] = useState<number>(3);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickFeedback = async (positive: boolean) => {
    if (!isAuthenticated) {
      setError('Please log in to provide feedback');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scan_id: scanId,
          feedback_type: positive ? 'good_result' : 'incorrect_prediction',
          is_correct: positive,
          confidence_rating: positive ? 5 : 1
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit feedback');
      }

      setSubmitted(true);
      onFeedbackSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedFeedback = async () => {
    if (!isAuthenticated) {
      setError('Please log in to provide feedback');
      return;
    }

    if (!feedbackType) {
      setError('Please select a feedback type');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scan_id: scanId,
          feedback_type: feedbackType,
          is_correct: isCorrect,
          correct_label: correctLabel || undefined,
          confidence_rating: confidenceRating,
          user_comment: userComment || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit feedback');
      }

      setSubmitted(true);
      setShowForm(false);
      onFeedbackSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
        <p className="text-green-400 font-medium">Thank you for your feedback!</p>
        <p className="text-gray-400 text-sm mt-1">Your input helps improve our AI models.</p>
      </div>
    );
  }

  const getLabelOptions = () => {
    switch (scanType) {
      case 'ai_detection':
        return ['AI Generated', 'Human Written', 'Mixed Content'];
      case 'plagiarism':
        return ['Original', 'Plagiarized', 'Partially Plagiarized'];
      case 'humanize':
        return ['Well Humanized', 'Still Detectable', 'Poor Quality'];
      default:
        return [];
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      {!showForm ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm">Was this result accurate?</span>
            {modelPrediction && (
              <span className="text-gray-500 text-xs">
                (Prediction: {modelPrediction}
                {modelConfidence !== undefined && ` - ${(modelConfidence * 100).toFixed(1)}%`})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickFeedback(true)}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
              <span className="text-sm">Yes</span>
            </button>
            <button
              onClick={() => handleQuickFeedback(false)}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
              <span className="text-sm">No</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Details</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">Provide Detailed Feedback</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">What type of issue?</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'incorrect_prediction', label: 'Wrong Prediction' },
                { value: 'false_positive', label: 'False Positive' },
                { value: 'false_negative', label: 'False Negative' },
                { value: 'poor_quality', label: 'Poor Quality' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFeedbackType(option.value as FeedbackType)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    feedbackType === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">What should the correct result be?</label>
            <select
              value={correctLabel}
              onChange={(e) => setCorrectLabel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select correct label...</option>
              {getLabelOptions().map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              How confident are you? ({confidenceRating}/5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidenceRating}
              onChange={(e) => setConfidenceRating(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not sure</span>
              <span>Very confident</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Additional comments (optional)</label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Tell us more about the issue..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleDetailedFeedback}
            disabled={isSubmitting || !feedbackType}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      )}

      {error && !showForm && (
        <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
