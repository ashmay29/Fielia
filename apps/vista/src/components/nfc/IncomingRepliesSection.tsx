"use client";

import { useCallback, useEffect, useState } from "react";

interface IncomingReply {
  id: string;
  messageId: string;
  from: string;
  senderName: string;
  messageType: string;
  text?: string;
  receivedAt: string;
  createdAt: string;
}

interface IncomingRepliesResponse {
  success: boolean;
  count: number;
  total: number;
  messages: IncomingReply[];
}

export default function IncomingRepliesSection() {
  const [replies, setReplies] = useState<IncomingReply[]>([]);
  const [repliesTotal, setRepliesTotal] = useState(0);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesError, setRepliesError] = useState<string | null>(null);

  const fetchReplies = useCallback(async () => {
    try {
      setLoadingReplies(true);
      setRepliesError(null);

      // Pull enough records to cover typical campaign traffic.
      const res = await fetch("/api/incoming-messages?limit=1000", {
        credentials: "same-origin",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch incoming replies");
      }

      const data: IncomingRepliesResponse = await res.json();
      setReplies(Array.isArray(data.messages) ? data.messages : []);
      setRepliesTotal(typeof data.total === "number" ? data.total : 0);
    } catch (error) {
      console.error("[IncomingRepliesSection] Failed to fetch replies:", error);
      setRepliesError("Unable to load incoming replies.");
    } finally {
      setLoadingReplies(false);
    }
  }, []);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  return (
    <div className="border-t border-[#E1D6C7]/10 pt-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-widest text-[#E1D6C7]/45">
          Incoming Replies
        </p>
        <button
          onClick={fetchReplies}
          disabled={loadingReplies}
          className="text-[10px] px-2 py-0.5 rounded border border-[#E1D6C7]/25 text-[#E1D6C7]/75 hover:bg-[#E1D6C7]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingReplies ? "Refreshing..." : "Refresh Replies"}
        </button>
      </div>

      <p className="text-[10px] text-[#E1D6C7]/50 mt-1">
        Showing {replies.length} of {repliesTotal} replies
      </p>

      {repliesError && (
        <p className="text-[10px] text-red-300/90 mt-1">{repliesError}</p>
      )}

      {!loadingReplies && replies.length === 0 && !repliesError && (
        <p className="text-xs text-[#E1D6C7]/60 mt-2">No incoming replies yet.</p>
      )}

      {replies.length > 0 && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded border border-[#E1D6C7]/10">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="px-2.5 py-2 border-b border-[#E1D6C7]/10 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[#E1D6C7] truncate">
                  {reply.senderName || "Unknown"}
                </p>
                <p className="text-[10px] text-[#E1D6C7]/55 font-mono shrink-0">
                  {new Date(reply.receivedAt).toLocaleString()}
                </p>
              </div>
              <p className="text-[10px] text-[#E1D6C7]/55 font-mono mt-0.5">
                {reply.from}
              </p>
              <p className="text-[11px] text-[#E1D6C7]/85 mt-1 wrap-break-word">
                {reply.text || `[${reply.messageType}]`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
