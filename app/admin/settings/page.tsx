"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Settings {
  galleryPassword: string;
  nextFlyerNumber: number;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/users"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings);
        setNewPassword(data.settings.galleryPassword);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword.trim()) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryPassword: newPassword }),
      });

      if (res.ok) {
        setSettings((prev) =>
          prev ? { ...prev, galleryPassword: newPassword } : null
        );
        setSaveMessage("Password updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Failed to update password");
    } finally {
      setIsSaving(false);
    }
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
        <h1 className="font-display text-3xl font-bold text-white">Settings</h1>
        <p className="text-vault-text-muted mt-1">
          Manage gallery access and view registered users
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="font-display text-xl font-semibold text-white mb-6">
            Gallery Access Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-vault-text-muted mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-dark pr-12"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-white"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-vault-text-muted text-xs mt-2">
                This password is shared with all gallery visitors
              </p>
            </div>

            {saveMessage && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm ${
                  saveMessage.includes("success")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {saveMessage}
              </motion.p>
            )}

            <button
              onClick={handleSavePassword}
              disabled={isSaving || newPassword === settings?.galleryPassword}
              className="btn-gold w-full disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update Password"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-vault-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-vault-text-muted text-sm">Next Flyer Code</p>
                <p className="text-white font-mono">
                  PROMO-{String(settings?.nextFlyerNumber || 1).padStart(4, "0")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Registered Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-white">
              Registered Users
            </h2>
            <span className="badge-gold">{users.length} users</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-vault-text-muted text-center py-8">
                No users registered yet
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-vault-dark rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-vault-text-muted text-xs">Joined</p>
                    <p className="text-white text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
