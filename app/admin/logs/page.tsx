"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LoginLog {
  id: string;
  email: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
  } | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    if (filter === "SUCCESS") return log.success;
    if (filter === "FAILED") return !log.success;
    return true;
  });

  const successCount = logs.filter((l) => l.success).length;
  const failedCount = logs.filter((l) => !l.success).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-white">Login Logs</h1>
        <p className="text-vault-text-muted mt-1">
          Track all login attempts to the gallery
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stats-card">
          <p className="text-vault-text-muted text-sm">Total Attempts</p>
          <p className="font-display text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="stats-card">
          <p className="text-vault-text-muted text-sm">Successful</p>
          <p className="font-display text-2xl font-bold text-green-400">{successCount}</p>
        </div>
        <div className="stats-card">
          <p className="text-vault-text-muted text-sm">Failed</p>
          <p className="font-display text-2xl font-bold text-red-400">{failedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["ALL", "SUCCESS", "FAILED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                : "text-vault-text-muted hover:text-white hover:bg-vault-gray"
            }`}
          >
            {f === "ALL" ? "All" : f === "SUCCESS" ? "Successful" : "Failed"}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vault-border">
                <th className="text-left p-4 text-vault-text-muted font-medium">Time</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">Email</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">Status</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">IP Address</th>
                <th className="text-left p-4 text-vault-text-muted font-medium">Browser</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-vault-text-muted">
                    No login attempts yet
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-vault-border/50 hover:bg-vault-gray/30 transition-colors"
                  >
                    <td className="p-4 text-white">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-white">{log.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          log.success
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.success ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        {log.success ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="p-4 text-vault-text-muted font-mono text-sm">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="p-4 text-vault-text-muted text-sm max-w-[200px] truncate">
                      {log.userAgent?.split(" ")[0] || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

