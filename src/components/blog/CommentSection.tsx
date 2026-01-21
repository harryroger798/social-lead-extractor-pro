"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Reply, Send, User, Clock } from "lucide-react";

interface Comment {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
  parentCommentId?: string;
}

interface CommentSectionProps {
  postId: string;
}

function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Organize comments into a tree structure
function organizeComments(comments: Comment[]): { topLevel: Comment[]; replies: Map<string, Comment[]> } {
  const topLevel: Comment[] = [];
  const replies = new Map<string, Comment[]>();

  comments.forEach((comment) => {
    if (comment.parentCommentId) {
      const existing = replies.get(comment.parentCommentId) || [];
      existing.push(comment);
      replies.set(comment.parentCommentId, existing);
    } else {
      topLevel.push(comment);
    }
  });

  return { topLevel, replies };
}

// Single comment component
function CommentItem({
  comment,
  replies,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  replies: Map<string, Comment[]>;
  onReply: (commentId: string, commentName: string) => void;
  depth?: number;
}) {
  const commentReplies = replies.get(comment._id) || [];
  const maxDepth = 3; // Limit nesting depth

  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l-2 border-amber-100" : ""}`}>
      <div className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{comment.name}</span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatCommentDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{comment.content}</p>
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment._id, comment.name)}
                className="mt-2 text-amber-600 hover:text-amber-700 text-sm flex items-center gap-1 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Render replies */}
      {commentReplies.length > 0 && (
        <div className="mt-2">
          {commentReplies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replies={replies}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Spam protection
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  // Fetch comments on mount
  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/comments?postId=${postId}`);
        const data = await response.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          content,
          postId,
          parentCommentId: replyTo?.id,
          honeypot,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setName("");
        setEmail("");
        setContent("");
        setReplyTo(null);
      } else {
        setSubmitError(data.error || "Failed to submit comment");
      }
    } catch (error) {
      setSubmitError("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle reply button click
  function handleReply(commentId: string, commentName: string) {
    setReplyTo({ id: commentId, name: commentName });
    // Scroll to form
    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" });
  }

  // Cancel reply
  function cancelReply() {
    setReplyTo(null);
  }

  const { topLevel, replies } = organizeComments(comments);

  return (
    <Card className="mt-12 border-amber-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-amber-600" />
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        <form id="comment-form" onSubmit={handleSubmit} className="mb-8">
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <h4 className="font-semibold text-gray-900 mb-4">
              {replyTo ? `Reply to ${replyTo.name}` : "Leave a Comment"}
            </h4>
            
            {replyTo && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">Replying to {replyTo.name}</span>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="text-amber-600 hover:text-amber-700 text-sm underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Honeypot field - hidden from users, visible to bots */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px]"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email * <span className="text-gray-400 text-xs">(not published)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts..."
              />
              <p className="text-xs text-gray-500 mt-1">{content.length}/2000 characters</p>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                Thank you! Your comment has been submitted and is awaiting approval.
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {submitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {replyTo ? "Post Reply" : "Post Comment"}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {topLevel.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  replies={replies}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
