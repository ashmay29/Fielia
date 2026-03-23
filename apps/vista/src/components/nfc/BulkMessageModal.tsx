"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  dispatchBulkWhatsAppJob,
  BulkWhatsAppResponse,
  CardData,
} from "@/app/nfc-card/actions";
import type { WhatsAppEndpointMode } from "@/lib/whatsapp";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateInfo {
  id: string;
  name: string;
  language: string;
  category: string;
  headerType: string | null; // IMAGE, DOCUMENT, VIDEO, TEXT, or null
  bodyText: string;
  variableCount: number;
}

interface JobProgress {
  jobId: string;
  total: number;
  processed: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
  failures: { uuid: string; phone: string; error: string }[];
}

type ModalStep = "compose" | "sending" | "progress";

// ─── File Size Limits ─────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 16 * 1024 * 1024; // 16 MB
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const DOCUMENT_EXTENSIONS = [".pdf"];
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS];

// ─── Props ────────────────────────────────────────────────────────────────────

interface BulkMessageModalProps {
  selectedUuids: string[];
  allCards: CardData[];
  onClose: () => void;
  onSuccessfulClose?: () => void;
}

export default function BulkMessageModal({
  selectedUuids,
  allCards,
  onClose,
  onSuccessfulClose,
}: BulkMessageModalProps) {
  // Steps
  const [step, setStep] = useState<ModalStep>("compose");

  // Template state
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(
    null,
  );
  const [variables, setVariables] = useState<string[]>([]);
  const [endpointMode, setEndpointMode] =
    useState<WhatsAppEndpointMode>("marketing");

  // Media state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Sending state
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkWhatsAppResponse | null>(null);

  // Progress polling
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Count users without valid phone numbers
  const selectedCards = allCards.filter((c) => selectedUuids.includes(c.uuid));
  const usersWithoutPhone = selectedCards.filter(
    (c) => !c.phone || c.phone.trim() === "",
  );

  // ─── Fetch Templates ─────────────────────────────────────────────────

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates", { credentials: "same-origin" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // ─── Template Selection ─────────────────────────────────────────────

  const handleTemplateChange = (templateName: string) => {
    const tmpl = templates.find((t) => t.name === templateName) || null;
    setSelectedTemplate(tmpl);
    setVariables(tmpl ? Array(tmpl.variableCount).fill("") : []);
    // Reset media when template changes
    setSelectedFile(null);
    setMediaUrl(null);
    setMediaError(null);
  };

  // ─── File Validation & Upload ───────────────────────────────────────

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError(null);

    // Check extension
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setMediaError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }

    // Check size
    const isImage = IMAGE_EXTENSIONS.includes(ext);
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      setMediaError(`File too large. Maximum ${maxMB} MB for ${isImage ? "images" : "documents"}.`);
      return;
    }

    setSelectedFile(file);
    setUploadingMedia(true);

    try {
      // Get Cloudinary upload signature from our API
      const sigRes = await fetch("/api/upload-signature", {
        credentials: "same-origin",
      });
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const sigData = await sigRes.json();
      console.log("Upload signature data:", {
        cloudName: sigData.cloudName,
        apiKey: sigData.apiKey,
        timestamp: sigData.timestamp,
        folder: sigData.folder,
      });

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp.toString());
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
        { method: "POST", body: formData },
      );

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        console.error("Cloudinary error response:", errorData);
        const cloudinaryError = errorData.error?.message || "Cloudinary upload failed";
        throw new Error(cloudinaryError);
      }
      const uploadData = await uploadRes.json();
      setMediaUrl(uploadData.secure_url);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Failed to upload file";
      setMediaError(message);
      setSelectedFile(null);
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setMediaUrl(null);
    setMediaError(null);
  };

  // ─── Send ─────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!selectedTemplate) return;
    setSendError(null);
    setStep("sending");

    try {
      const response = await dispatchBulkWhatsAppJob(
        selectedUuids,
        selectedTemplate.name,
        variables,
        mediaUrl || undefined,
        endpointMode,
      );

      setResult(response);

      if (response.success && response.jobId) {
        setStep("progress");
        startPolling(response.jobId);
      } else {
        setSendError(response.error || "Failed to dispatch");
        setStep("compose");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setSendError(message);
      setStep("compose");
    }
  };

  // ─── Progress Polling ─────────────────────────────────────────────────

  const startPolling = useCallback((jobId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const data: JobProgress = await res.json();
        setProgress(data);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Initial fetch
    poll();
    // Then every 3 seconds
    pollRef.current = setInterval(poll, 3000);
  }, []);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────

  const isFormValid =
    selectedTemplate &&
    variables.every((v) => v.trim() !== "") &&
    !uploadingMedia &&
    (selectedTemplate.headerType === "IMAGE" ||
    selectedTemplate.headerType === "DOCUMENT"
      ? !!mediaUrl
      : true);

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  const handleClose = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const isSuccessfulRun =
      step === "progress" &&
      !!result?.success &&
      !!result?.jobId;

    if (isSuccessfulRun) {
      onSuccessfulClose?.();
      return;
    }

    onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && step === "compose") handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="w-full max-w-lg bg-[rgba(20,20,20,0.95)] backdrop-blur-md border border-[#E1D6C7]/20 rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1D6C7]/10">
            <div>
              <h2 className="text-lg font-serif text-[#E1D6C7]">
                {step === "progress" ? "Message Progress" : "Compose Bulk Message"}
              </h2>
              <p className="text-xs text-[#E1D6C7]/50 mt-0.5">
                {selectedUuids.length} recipient{selectedUuids.length !== 1 ? "s" : ""} selected
                {usersWithoutPhone.length > 0 && (
                  <span className="text-amber-400/80">
                    {" "}
                    ({usersWithoutPhone.length} without phone — will be skipped)
                  </span>
                )}
              </p>
            </div>
            {step !== "sending" && (
              <button
                onClick={handleClose}
                className="text-[#E1D6C7]/50 hover:text-[#E1D6C7] transition-colors text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {/* ─── Compose Step ──────────────────────────────────── */}
            {step === "compose" && (
              <div className="space-y-5">
                {sendError && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm">
                    {sendError}
                  </div>
                )}

                {/* Template Selection */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#E1D6C7]/70 mb-2">
                    Message Template
                  </label>
                  {templatesLoading ? (
                    <div className="text-[#E1D6C7]/50 text-sm py-2">
                      Loading templates...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-amber-400/80 text-sm py-2">
                      No approved templates found. Create templates in the Meta
                      Business Dashboard first.
                    </div>
                  ) : (
                    <select
                      value={selectedTemplate?.name || ""}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full bg-black/40 border border-[#E1D6C7]/30 rounded px-4 py-2.5 text-[#E1D6C7] text-sm focus:outline-none focus:border-[#E1D6C7] transition-colors"
                    >
                      <option value="">Select a template...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.language})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Endpoint Selection */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#E1D6C7]/70 mb-2">
                    Delivery Route
                  </label>
                  <select
                    value={endpointMode}
                    onChange={(e) => setEndpointMode(e.target.value as WhatsAppEndpointMode)}
                    className="w-full bg-black/40 border border-[#E1D6C7]/30 rounded px-4 py-2.5 text-[#E1D6C7] text-sm focus:outline-none focus:border-[#E1D6C7] transition-colors"
                  >
                    <option value="marketing">Marketing API (recommended)</option>
                    <option value="standard">Standard API (/messages)</option>
                  </select>
                  <p className="text-[10px] text-[#E1D6C7]/45 mt-1">
                    Marketing API falls back to standard automatically if unsupported.
                  </p>
                </div>

                {/* Template Preview */}
                {selectedTemplate && selectedTemplate.bodyText && (
                  <div className="bg-black/20 border border-[#E1D6C7]/10 rounded p-3">
                    <span className="block text-[10px] uppercase tracking-widest text-[#E1D6C7]/50 mb-1">
                      Template Preview
                    </span>
                    <p className="text-[#E1D6C7]/80 text-sm whitespace-pre-wrap">
                      {selectedTemplate.bodyText}
                    </p>
                  </div>
                )}

                {/* Template Variables */}
                {selectedTemplate && selectedTemplate.variableCount > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-widest text-[#E1D6C7]/70">
                      Template Variables
                    </label>
                    {variables.map((v, i) => (
                      <div key={i}>
                        <label className="block text-[10px] text-[#E1D6C7]/50 mb-1">
                          {"{{"}
                          {i + 1}
                          {"}}"}
                        </label>
                        <input
                          type="text"
                          value={v}
                          onChange={(e) => {
                            const updated = [...variables];
                            updated[i] = e.target.value;
                            setVariables(updated);
                          }}
                          placeholder={`Value for variable ${i + 1}`}
                          className="w-full bg-black/40 border border-[#E1D6C7]/30 rounded px-4 py-2 text-[#E1D6C7] text-sm focus:outline-none focus:border-[#E1D6C7] transition-colors placeholder-[#E1D6C7]/30"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Media Upload — only if template has IMAGE or DOCUMENT header */}
                {selectedTemplate &&
                  (selectedTemplate.headerType === "IMAGE" ||
                    selectedTemplate.headerType === "DOCUMENT") && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#E1D6C7]/70 mb-2">
                        Media Attachment{" "}
                        <span className="text-[#E1D6C7]/40 normal-case">
                          ({selectedTemplate.headerType === "IMAGE" ? "Image — max 5 MB" : "Document — max 16 MB"})
                        </span>
                      </label>

                      {!selectedFile && !mediaUrl && (
                        <label className="block w-full border-2 border-dashed border-[#E1D6C7]/20 rounded-lg p-6 text-center cursor-pointer hover:border-[#E1D6C7]/40 transition-colors">
                          <input
                            type="file"
                            accept={
                              selectedTemplate.headerType === "IMAGE"
                                ? ".png,.jpg,.jpeg"
                                : ".pdf"
                            }
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="text-[#E1D6C7]/50 text-sm">
                            Click to select a file
                          </span>
                        </label>
                      )}

                      {uploadingMedia && (
                        <div className="flex items-center gap-2 text-[#E1D6C7]/50 text-sm py-2">
                          <div className="w-4 h-4 border-2 border-[#C5A572] border-t-transparent rounded-full animate-spin" />
                          Uploading to Cloudinary...
                        </div>
                      )}

                      {selectedFile && mediaUrl && (
                        <div className="flex items-center justify-between bg-black/30 border border-[#E1D6C7]/20 rounded px-4 py-2.5">
                          <span className="text-[#E1D6C7]/80 text-sm truncate mr-3">
                            {selectedFile.name}
                          </span>
                          <button
                            onClick={removeFile}
                            className="text-red-400 hover:text-red-300 text-xs uppercase tracking-wider shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {mediaError && (
                        <p className="text-red-400 text-xs mt-1">{mediaError}</p>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* ─── Sending Step ──────────────────────────────────── */}
            {step === "sending" && (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-10 h-10 border-3 border-[#C5A572] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#E1D6C7]/70 text-sm">
                  Dispatching messages...
                </p>
              </div>
            )}

            {/* ─── Progress Step ─────────────────────────────────── */}
            {step === "progress" && (
              <div className="space-y-5">
                {/* Result summary */}
                {result && (
                  <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded text-sm">
                    Job <span className="font-mono font-bold">{result.jobId}</span>{" "}
                    dispatched — {result.totalQueued} message
                    {result.totalQueued !== 1 ? "s" : ""} queued.
                  </div>
                )}

                {/* Skipped users */}
                {result?.skippedUsers && result.skippedUsers.length > 0 && (
                  <div className="bg-amber-900/20 border border-amber-500/30 text-amber-400 px-4 py-3 rounded text-sm">
                    <p className="font-semibold mb-1">
                      {result.skippedUsers.length} user
                      {result.skippedUsers.length !== 1 ? "s" : ""} skipped:
                    </p>
                    <ul className="text-xs space-y-0.5 mt-1">
                      {result.skippedUsers.map((u) => (
                        <li key={u.uuid}>
                          {u.firstName} {u.lastName} — {u.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progress bar */}
                {progress && (
                  <div>
                    <div className="flex justify-between text-xs text-[#E1D6C7]/50 mb-2">
                      <span>
                        {progress.processed} / {progress.total}
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C5A572] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex gap-4 mt-3 text-xs flex-wrap">
                      <span className="text-[#7ee3ff]">
                        ✓ Sent: {progress.sent}
                      </span>
                      <span className="text-blue-300">
                        📱 Delivered: {progress.delivered}
                      </span>
                      <span className="text-emerald-400">
                        👁️ Opened: {progress.read}
                      </span>
                      <span className="text-red-400">
                        ❌ Failed: {progress.failed}
                      </span>
                      <span className="text-[#E1D6C7]/50">
                        ⏳ Pending: {progress.pending}
                      </span>
                    </div>

                    <p className="text-[9px] text-[#E1D6C7]/40 mt-2 italic">
                      💡 "Opened" updates only if recipient has read receipts enabled
                    </p>

                    {progress.pending === 0 && (
                      <p className="text-[#C5A572] text-sm mt-3 font-serif">
                        ✓ All messages processed
                      </p>
                    )}
                  </div>
                )}

                {/* Failures list */}
                {progress &&
                  progress.failures.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-red-400/80 mb-2">
                        Failed Messages
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {progress.failures.map((f) => (
                          <div
                            key={f.uuid}
                            className="bg-red-900/10 border border-red-500/10 rounded px-3 py-1.5 text-xs text-red-400/80"
                          >
                            <span className="font-mono">{f.phone}</span> —{" "}
                            {f.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-4 border-t border-[#E1D6C7]/10 flex items-center gap-3 ${
              step === "progress" ? "justify-between" : "justify-end"
            }`}
          >
            {step === "compose" && (
              <>
                <button
                  onClick={handleClose}
                  className="px-5 py-2 border border-[#E1D6C7]/30 text-[#E1D6C7]/70 rounded text-xs uppercase tracking-wider hover:bg-[#E1D6C7]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!isFormValid}
                  className="px-5 py-2 bg-[#C5A572] text-[#1a0505] rounded text-xs uppercase tracking-wider font-bold hover:bg-[#E1D6C7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send to {selectedUuids.length - usersWithoutPhone.length} User
                  {selectedUuids.length - usersWithoutPhone.length !== 1 ? "s" : ""}
                </button>
              </>
            )}
            {step === "progress" && (
              <>
                <div className="bg-black/30 border border-[#E1D6C7]/20 rounded px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#E1D6C7]/50 mb-1">
                    Message Insights
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#7ee3ff]">Sent: {progress?.sent ?? 0}</span>
                    <span className="text-blue-300">Delivered: {progress?.delivered ?? 0}</span>
                    <span className="text-emerald-400">Read: {progress?.read ?? 0}</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="px-5 py-2 border border-[#E1D6C7]/30 text-[#E1D6C7] rounded text-xs uppercase tracking-wider hover:bg-[#E1D6C7]/10 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
