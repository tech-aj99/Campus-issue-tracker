import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket, useJoinRoom } from '../../hooks/useSocket';
import { getComments, addComment, deleteComment, Comment } from '../../api/commentApi';
import toast from 'react-hot-toast';

interface Props {
  issueId: string;
}

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-green-100 text-green-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function CommentsSection({ issueId }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Join the issue-specific socket room for real-time comment updates
  useJoinRoom(`issue:${issueId}`);

  // Listen for real-time new comments from other users
  const handleNewComment = useCallback((comment: Comment) => {
    setComments((prev) => {
      // Avoid duplicates (optimistic comment already added)
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [...prev, comment];
    });
  }, []);
  useSocket<Comment>('comment:new', handleNewComment);

  useEffect(() => {
    setLoading(true);
    getComments(issueId)
      .then(setComments)
      .catch(() => toast.error('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [issueId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // Optimistic update
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Comment = {
      id: optimisticId,
      issueId,
      authorId: user!.id,
      author: { id: user!.id, name: user!.name, role: user!.role },
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    setText('');
    setSubmitting(true);

    try {
      const saved = await addComment(issueId, trimmed);
      // Replace optimistic with real comment
      setComments((prev) => prev.map((c) => (c.id === optimisticId ? saved : c)));
    } catch {
      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      setText(trimmed);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteComment(id);
    } catch {
      toast.error('Failed to delete comment');
      // Re-fetch to restore accurate state
      getComments(issueId).then(setComments).catch(() => {});
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>💬</span> Comments ({comments.length})
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <span className="animate-spin">⏳</span> Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-2xl mb-2">💬</p>
          <p className="text-sm text-gray-400">No comments yet. Be the first to add one.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border p-3.5 transition-all ${
                c.id.startsWith('optimistic-')
                  ? 'border-indigo-200 bg-indigo-50/50 opacity-70'
                  : 'border-gray-100 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {c.author.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{c.author.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                      ROLE_COLORS[c.author.role] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.author.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{timeAgo(c.createdAt)}</span>
                  {user && c.authorId === user.id && !c.id.startsWith('optimistic-') && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[11px] text-red-400 hover:text-red-600 hover:underline transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-1 w-full">
          <textarea
            id="comment-input"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment or progress note…"
            className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e as unknown as React.FormEvent);
            }}
          />
          <p className="text-[10px] text-gray-400 mt-1 ml-1">Ctrl+Enter to send</p>
        </div>
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="w-full sm:w-auto mb-0 sm:mb-5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {submitting ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
