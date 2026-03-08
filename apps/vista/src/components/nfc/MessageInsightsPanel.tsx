"use client";

import { useEffect, useState, useCallback } from "react";
import IncomingRepliesSection from "./IncomingRepliesSection";

interface JobInsights {
  jobId: string | null;
  total: number;
  processed: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
  updatedAt?: string;
}

interface InsightsResponse {
  latestJob: JobInsights | null;
  allJobs: Omit<JobInsights, "jobId" | "updatedAt">;
}

interface MessageInsightsPanelProps {
  className?: string;
}

export default function MessageInsightsPanel({
  className = "",
}: MessageInsightsPanelProps) {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFailed, setDownloadingFailed] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [retryingFailed, setRetryingFailed] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/jobs/latest", {
        credentials: "same-origin",
      });

      if (!res.ok) {
        return;
      }

      const data: InsightsResponse = await res.json();
      setInsights(data);
    } catch (error) {
      console.error("[MessageInsightsPanel] Failed to fetch insights:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    // Poll every 1 hour instead of 5 seconds
    const interval = setInterval(fetchInsights, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchInsights]);

  const handleRefresh = () => {
    fetchInsights();
  };

  const handleDownloadFailedCsv = async () => {
    const jobId = insights?.latestJob?.jobId;
    if (!jobId) return;

    try {
      setDownloadingFailed(true);
      setDownloadError(null);

      const res = await fetch(`/api/jobs/${jobId}`, {
        credentials: "same-origin",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch failed numbers");
      }

      const data = await res.json();
      const failures = Array.isArray(data?.failures) ? data.failures : [];

      if (failures.length === 0) {
        setDownloadError("No failed numbers found for this job.");
        return;
      }

      const escapeCsv = (value: unknown) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const header = ["uuid", "phone", "error"];
      const rows = failures.map((f: { uuid?: string; phone?: string; error?: string }) =>
        [escapeCsv(f.uuid), escapeCsv(f.phone), escapeCsv(f.error)].join(","),
      );

      const csv = [header.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `failed-numbers-${jobId}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[MessageInsightsPanel] Failed CSV download error:", error);
      setDownloadError("Unable to download failed numbers CSV.");
    } finally {
      setDownloadingFailed(false);
    }
  };

  const handleRetryFailed = async () => {
    const jobId = insights?.latestJob?.jobId;
    if (!jobId) return;

    try {
      setRetryingFailed(true);
      setRetryError(null);

      const res = await fetch(`/api/jobs/${jobId}/retry-failed`, {
        method: "POST",
        credentials: "same-origin",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Retry unavailable for this job. Please re-enter template params and resend failed users from UI.",
        );
      }

      handleRefresh();
    } catch (error) {
      console.error("[MessageInsightsPanel] Retry failed error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to retry failed messages.";
      setRetryError(message);
    } finally {
      setRetryingFailed(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="bg-black/75 backdrop-blur-md border border-[#E1D6C7]/25 rounded-lg px-3 py-2 shadow-xl text-left w-full sm:w-auto min-w-[180px]"
        >
          <p className="text-[9px] uppercase tracking-widest text-[#E1D6C7]/55">
            Message Insights
          </p>
          <p className="text-[11px] mt-0.5 text-[#E1D6C7]/80">
            Click to {isOpen ? "hide" : "view"} details
          </p>
        </button>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-black/75 backdrop-blur-md border border-[#E1D6C7]/25 rounded-lg px-3 py-2 shadow-xl hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh job insights"
        >
          <svg
            className={`w-4 h-4 text-[#E1D6C7]/80 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 bg-black/80 backdrop-blur-md border border-[#E1D6C7]/20 rounded-lg p-2.5 shadow-xl max-w-[440px]">
          {loading ? (
            <p className="text-xs text-[#E1D6C7]/60">Loading...</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#E1D6C7]/45 mb-1">
                  All Jobs Totals (All-Time)
                </p>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="text-[#7ee3ff]" title="Successfully sent from server">
                    ✓ Sent: {insights?.allJobs.sent ?? 0}
                  </span>
                  <span className="text-blue-300" title="Reached recipient's phone (grey ticks)">
                    📱 Delivered: {insights?.allJobs.delivered ?? 0}
                  </span>
                  <span className="text-emerald-400" title="Recipient opened the message (blue ticks)">
                    👁️ Opened: {insights?.allJobs.read ?? 0}
                  </span>
                  <span className="text-red-400">❌ Failed: {insights?.allJobs.failed ?? 0}</span>
                  <span className="text-[#E1D6C7]/70">
                    Total: {insights?.allJobs.processed ?? 0}/{insights?.allJobs.total ?? 0}
                  </span>
                </div>
                <p className="text-[9px] text-[#E1D6C7]/40 mt-1.5 italic">
                  Note: &quot;Opened&quot; only shows if recipient has read receipts enabled
                </p>
              </div>

              <div className="border-t border-[#E1D6C7]/10 pt-2">
                <p className="text-[10px] uppercase tracking-widest text-[#E1D6C7]/45 mb-1">
                  Latest Job
                </p>
                {!insights?.latestJob?.jobId ? (
                  <p className="text-xs text-[#E1D6C7]/60">No recent messaging job yet.</p>
                ) : (
                  <>
                    <p className="text-[10px] text-[#E1D6C7]/40 font-mono truncate">
                      Job: {insights.latestJob.jobId}
                    </p>
                    <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                      <span className="text-[#7ee3ff]">✓ Sent: {insights.latestJob.sent}</span>
                      <span className="text-blue-300">📱 Delivered: {insights.latestJob.delivered}</span>
                      <span className="text-emerald-400">👁️ Opened: {insights.latestJob.read}</span>
                      <span className="text-red-400">❌ Failed: {insights.latestJob.failed}</span>
                      <span className="text-[#E1D6C7]/70">
                        Total: {insights.latestJob.processed}/{insights.latestJob.total}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleRetryFailed}
                        disabled={retryingFailed || insights.latestJob.failed === 0}
                        className="text-[11px] px-2.5 py-1 rounded border border-amber-300/40 text-amber-200 hover:bg-amber-300/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Retry all failed messages for this same job"
                      >
                        {retryingFailed
                          ? "Retrying..."
                          : `Retry Failed (${insights.latestJob.failed})`}
                      </button>
                      <button
                        onClick={handleDownloadFailedCsv}
                        disabled={downloadingFailed || insights.latestJob.failed === 0}
                        className="text-[11px] px-2.5 py-1 rounded border border-red-400/40 text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download failed numbers as CSV"
                      >
                        {downloadingFailed
                          ? "Preparing CSV..."
                          : `Download Failed CSV (${insights.latestJob.failed})`}
                      </button>
                      {downloadError && (
                        <span className="text-[10px] text-red-300/90">{downloadError}</span>
                      )}
                      {retryError && (
                        <span className="text-[10px] text-red-300/90">{retryError}</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <IncomingRepliesSection />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
