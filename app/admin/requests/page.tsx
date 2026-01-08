"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Request {
  id: string;
  message?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  flyer: {
    id: string;
    code: string;
    title: string;
    imageUrl: string;
  };
  user: {
    id: string;
    email: string;
  };
}

const statusOptions = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

const statusColors = {
  PENDING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: newStatus as Request["status"] } : r
          )
        );
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === "ALL" || request.status === filter;
    const matchesSearch =
      search === "" ||
      request.flyer.code.toLowerCase().includes(search.toLowerCase()) ||
      request.user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        <h1 className="font-display text-3xl font-bold text-white">Requests</h1>
        <p className="text-vault-text-muted mt-1">
          Manage production requests from your clients
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by code or email..."
            className="input-dark"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "ALL"
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                : "text-vault-text-muted hover:text-white hover:bg-vault-gray"
            }`}
          >
            All
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? statusColors[status]
                  : "text-vault-text-muted hover:text-white hover:bg-vault-gray"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {filteredRequests.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-vault-text-muted">
              {search || filter !== "ALL"
                ? "No requests match your filters"
                : "No requests yet"}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="glass rounded-xl p-6 flex flex-col md:flex-row gap-6"
            >
              {/* Flyer Preview */}
              <div className="flex-shrink-0">
                <img
                  src={request.flyer.imageUrl}
                  alt={request.flyer.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="badge-gold">{request.flyer.code}</span>
                    <h3 className="text-white font-semibold mt-2">
                      {request.flyer.title}
                    </h3>
                  </div>
                  <select
                    value={request.status}
                    onChange={(e) => updateStatus(request.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${statusColors[request.status]}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status} className="bg-vault-dark">
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-vault-text-muted">Requested by</p>
                    <p className="text-white">{request.user.email}</p>
                  </div>
                  <div>
                    <p className="text-vault-text-muted">Submitted</p>
                    <p className="text-white">
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="mt-4 p-3 bg-vault-dark rounded-lg">
                    <p className="text-vault-text-muted text-xs mb-1">Message</p>
                    <p className="text-white text-sm">{request.message}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
