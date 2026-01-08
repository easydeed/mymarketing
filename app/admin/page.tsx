"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Stats {
  totalFlyers: number;
  totalViews: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalUsers: number;
  topFlyers: Array<{
    id: string;
    code: string;
    title: string;
    _count: { views: number; requests: number };
  }>;
  recentRequests: Array<{
    id: string;
    createdAt: string;
    status: string;
    flyer: { code: string; title: string };
    user: { email: string };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Flyers",
      value: stats?.totalFlyers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Views",
      value: stats?.totalViews || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Requests",
      value: stats?.totalRequests || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "text-gold-400",
      bgColor: "bg-gold-500/10",
    },
    {
      label: "Pending",
      value: stats?.pendingRequests || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Completed",
      value: stats?.completedRequests || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Registered Users",
      value: stats?.totalUsers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-vault-text-muted mt-1">
          Overview of your promotional gallery
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.label} variants={item} className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-vault-text-muted text-sm">{stat.label}</p>
                <p className="font-display text-3xl font-bold text-white mt-1">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Flyers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Top Performing Flyers
          </h2>
          <div className="space-y-4">
            {stats?.topFlyers && stats.topFlyers.length > 0 ? (
              stats.topFlyers.map((flyer, index) => (
                <div
                  key={flyer.id}
                  className="flex items-center justify-between p-3 bg-vault-dark rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gold-400 font-semibold">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">{flyer.code}</p>
                      <p className="text-vault-text-muted text-sm truncate max-w-[200px]">
                        {flyer.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{flyer._count.views} views</p>
                    <p className="text-vault-text-muted text-sm">
                      {flyer._count.requests} requests
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-vault-text-muted text-center py-8">
                No flyers yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Recent Requests
          </h2>
          <div className="space-y-4">
            {stats?.recentRequests && stats.recentRequests.length > 0 ? (
              stats.recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-vault-dark rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {request.flyer.code}
                    </p>
                    <p className="text-vault-text-muted text-sm">
                      {request.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        request.status === "PENDING"
                          ? "bg-orange-500/20 text-orange-400"
                          : request.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : request.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                    <p className="text-vault-text-muted text-xs mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-vault-text-muted text-center py-8">
                No requests yet
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
