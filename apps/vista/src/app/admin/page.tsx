"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  loginAdmin,
  logoutAdmin,
  getMembershipApplications,
  updateApplicationStatus,
} from "./actions";

type Application = {
  _id: string;
  fullName: string;
  email: string;
  reason: string;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    const response = await getMembershipApplications();
    if (response.success && response.data) {
      setIsAuthenticated(true);
      setApplications(response.data);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    const response = await loginAdmin(loginForm.username, loginForm.password);

    if (response.success) {
      setIsAuthenticated(true);
      await checkAuth();
    } else {
      setLoginError(response.error || "Login failed");
    }

    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setApplications([]);
    router.refresh();
  };

  const handleStatusUpdate = async (
    id: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    const response = await updateApplicationStatus(id, status);
    if (response.success) {
      // Refresh applications
      await checkAuth();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a0505] flex items-center justify-center">
        <div className="text-[#E1D6C7] text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a0505] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "url(/satinbg.jpeg)",
            backgroundSize: "cover",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-md border border-[#E1D6C7]/20 p-8 rounded-lg"
        >
          <h1 className="text-3xl font-serif text-[#E1D6C7] mb-6 text-center">
            Admin Login
          </h1>

          {loginError && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-4 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#E1D6C7]/70 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-[#E1D6C7]/30 py-2 text-[#E1D6C7] focus:outline-none focus:border-[#E1D6C7] transition-colors disabled:opacity-50"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#E1D6C7]/70 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-[#E1D6C7]/30 py-2 text-[#E1D6C7] focus:outline-none focus:border-[#E1D6C7] transition-colors disabled:opacity-50"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#C5A572] text-[#1a0505] font-bold uppercase tracking-widest rounded hover:bg-[#E1D6C7] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0505] text-[#E1D6C7] p-4 md:p-8">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif">
            Membership Applications
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-[#E1D6C7]/30 text-[#E1D6C7] rounded hover:bg-[#E1D6C7]/10 transition-colors text-sm uppercase tracking-wider"
          >
            Logout
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-[#E1D6C7]/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#C5A572]/10 border-b border-[#E1D6C7]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1D6C7]/10">
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-[#E1D6C7]/50"
                    >
                      No applications yet
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-[#E1D6C7]/5 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">{app.fullName}</td>
                      <td className="px-4 py-4 text-sm">{app.email}</td>
                      <td
                        className="px-4 py-4 text-sm max-w-xs truncate"
                        title={app.reason}
                      >
                        {app.reason}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${
                            app.status === "approved"
                              ? "bg-green-900/30 text-green-400 border border-green-500/30"
                              : app.status === "rejected"
                              ? "bg-red-900/30 text-red-400 border border-red-500/30"
                              : "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#E1D6C7]/70">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(app._id, "approved")
                            }
                            className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-900/50 transition-colors"
                            disabled={app.status === "approved"}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(app._id, "rejected")
                            }
                            className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-900/50 transition-colors"
                            disabled={app.status === "rejected"}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-[#E1D6C7]/50 text-center">
          Total Applications: {applications.length}
        </div>
      </div>
    </div>
  );
}
