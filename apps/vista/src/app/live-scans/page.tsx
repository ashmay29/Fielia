"use client";

import { useState, useEffect } from "react";
import { getRecentScans, ScanEvent } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveScansPage() {
  const [timeRange, setTimeRange] = useState<number>(60 * 60 * 1000); // Default 60 mins
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeOptions = [
    { label: "Past 10 Minutes", value: 10 * 60 * 1000 },
    { label: "Past 60 Minutes", value: 60 * 60 * 1000 },
    { label: "Past 10 Hours", value: 10 * 60 * 60 * 1000 },
    { label: "Past 1 Day", value: 24 * 60 * 60 * 1000 },
    { label: "Past 1 Week", value: 7 * 24 * 60 * 60 * 1000 },
  ];

  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeAgo, setTimeAgo] = useState<{ [key: string]: string }>({});

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const updateTimeAgo = () => {
    const newTimeAgo: { [key: string]: string } = {};
    scans.forEach((scan) => {
      newTimeAgo[scan.timestamp] = getRelativeTime(scan.timestamp);
    });
    setTimeAgo(newTimeAgo);
  };

  const fetchScans = async () => {
    setIsLoading(true);
    const response = await getRecentScans(timeRange);
    if (response.success && response.data) {
      setScans(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Fetch immediately
    fetchScans();

    // Poll every 30 seconds
    const interval = setInterval(fetchScans, 30000);

    // Update "time ago" display every minute
    const timeInterval = setInterval(updateTimeAgo, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [timeRange]);

  useEffect(() => {
    updateTimeAgo();
  }, [scans]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(350,40%,8%)] text-[var(--color-surface)] flex flex-col">
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Header */}
      <div className="relative z-20 w-full p-6 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-[#E1D6C7]/10">
        <div className="flex items-center gap-4">
          <span className="text-[#C5A572] text-2xl">❖</span>
          <h1 className="text-xl font-serif text-[#E1D6C7]">Live Scans</h1>
        </div>
        {/* Time Range Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-xs uppercase tracking-widest text-[#E1D6C7]/70 hover:text-[#E1D6C7] transition-colors flex items-center gap-2"
          >
            {timeOptions.find((o) => o.value === timeRange)?.label}
            <span className="text-[10px]">▼</span>
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-md border border-[#E1D6C7]/20 rounded z-50 py-1 shadow-xl">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeRange(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`nav-item w-full text-left px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-[#E1D6C7]/10 ${
                      timeRange === option.value
                        ? "text-[#C5A572]"
                        : "text-[#E1D6C7]/70"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 md:p-8 overflow-auto flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <h2 className="text-2xl font-serif text-[#E1D6C7] mb-2">
              No recent activity
            </h2>
            <p className="text-sm">No scans detected in the last hour</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {scans.map((scan, index) => (
                <motion.div
                  key={`${scan.uuid}-${scan.timestamp}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black/40 backdrop-blur-md border border-[#E1D6C7]/20 p-6 rounded-lg hover:bg-[#E1D6C7]/5 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C5A572]/20 flex items-center justify-center text-[#C5A572] font-serif text-lg">
                        {scan.firstName[0]}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-[#E1D6C7]">
                          {scan.firstName} {scan.lastName}
                        </h3>
                        <p className="text-[10px] uppercase tracking-wider text-[#E1D6C7]/50">
                          {scan.preference ? "VIP" : "Guest"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#C5A572]">
                      {timeAgo[scan.timestamp] ||
                        getRelativeTime(scan.timestamp)}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="mt-4 pt-4 border-t border-[#E1D6C7]/10 space-y-2">
                    {scan.preference && (
                      <div className="text-sm">
                        <span className="text-[#C5A572] text-xs uppercase tracking-wider font-bold">
                          Preference:
                        </span>
                        <p className="text-[#E1D6C7]/80 italic mt-1">
                          "{scan.preference}"
                        </p>
                      </div>
                    )}

                    {scan.content && (
                      <div className="text-sm">
                        <span className="text-[#C5A572] text-xs uppercase tracking-wider font-bold">
                          Content:
                        </span>
                        <p className="text-[#E1D6C7]/80 mt-1">{scan.content}</p>
                      </div>
                    )}

                    {(scan.phone || scan.address) && (
                      <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-[#E1D6C7]/5">
                        {scan.phone && (
                          <div className="text-xs text-[#E1D6C7]/60 font-mono flex items-center gap-2">
                            <span className="text-[#C5A572]">📞</span>{" "}
                            {scan.phone}
                          </div>
                        )}
                        {scan.address && (
                          <div className="text-xs text-[#E1D6C7]/60 font-mono flex items-center gap-2">
                            <span className="text-[#C5A572]">📍</span>{" "}
                            {scan.address}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center text-xs text-[#E1D6C7]/30 font-mono pt-2 border-t border-[#E1D6C7]/5">
                    <span>
                      {new Date(scan.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{scan.uuid.slice(-4)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
