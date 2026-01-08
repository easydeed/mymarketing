"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Flyer {
  id: string;
  code: string;
  title: string;
  description?: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  _count: { views: number; requests: number };
}

export default function AdminFlyersPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFlyer, setEditingFlyer] = useState<Flyer | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    file: null as File | null,
    preview: "",
  });

  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    try {
      const res = await fetch("/api/admin/flyers");
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploadForm((prev) => ({
        ...prev,
        file,
        preview: URL.createObjectURL(file),
      }));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm((prev) => ({
        ...prev,
        file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) return;

    setIsUploading(true);
    try {
      // First upload the image
      const formData = new FormData();
      formData.append("file", uploadForm.file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url } = await uploadRes.json();

      // Then create the flyer
      const flyerRes = await fetch("/api/admin/flyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          imageUrl: url,
        }),
      });

      if (!flyerRes.ok) throw new Error("Failed to create flyer");

      await fetchFlyers();
      setShowUploadModal(false);
      setUploadForm({ title: "", description: "", file: null, preview: "" });
    } catch (error) {
      console.error("Error uploading flyer:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleActive = async (flyer: Flyer) => {
    try {
      const res = await fetch(`/api/admin/flyers/${flyer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !flyer.active }),
      });

      if (res.ok) {
        setFlyers((prev) =>
          prev.map((f) =>
            f.id === flyer.id ? { ...f, active: !f.active } : f
          )
        );
      }
    } catch (error) {
      console.error("Error toggling flyer:", error);
    }
  };

  const deleteFlyer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flyer?")) return;

    try {
      const res = await fetch(`/api/admin/flyers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFlyers((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Error deleting flyer:", error);
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
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-white">Flyers</h1>
          <p className="text-vault-text-muted mt-1">
            Manage your promotional flyers
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowUploadModal(true)}
          className="btn-gold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Flyer
        </motion.button>
      </div>

      {/* Flyers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vault-border">
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Preview
                </th>
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Code
                </th>
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Title
                </th>
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Views
                </th>
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Requests
                </th>
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Status
                </th>
                <th className="text-left p-4 text-vault-text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {flyers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-vault-text-muted">
                    No flyers yet. Click "Add Flyer" to get started.
                  </td>
                </tr>
              ) : (
                flyers.map((flyer) => (
                  <tr
                    key={flyer.id}
                    className="border-b border-vault-border/50 hover:bg-vault-gray/30 transition-colors"
                  >
                    <td className="p-4">
                      <img
                        src={flyer.imageUrl}
                        alt={flyer.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-4">
                      <span className="badge-gold">{flyer.code}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">{flyer.title}</p>
                      {flyer.description && (
                        <p className="text-vault-text-muted text-sm truncate max-w-[200px]">
                          {flyer.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-white">{flyer._count.views}</td>
                    <td className="p-4 text-white">{flyer._count.requests}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(flyer)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          flyer.active
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-vault-muted text-vault-text-muted hover:bg-vault-border"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            flyer.active ? "bg-green-400" : "bg-vault-text-muted"
                          }`}
                        />
                        {flyer.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteFlyer(flyer.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold text-white">
                  Add New Flyer
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-vault-text-muted hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? "border-gold-500 bg-gold-500/10"
                      : "border-vault-border hover:border-vault-muted"
                  }`}
                >
                  {uploadForm.preview ? (
                    <div className="relative">
                      <img
                        src={uploadForm.preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setUploadForm((prev) => ({
                            ...prev,
                            file: null,
                            preview: "",
                          }))
                        }
                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="w-12 h-12 mx-auto text-vault-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-vault-text-muted mb-2">
                        Drag and drop your flyer image here
                      </p>
                      <label className="btn-ghost inline-block cursor-pointer">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-dark"
                    placeholder="Flyer title"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    className="input-dark resize-none h-20"
                    placeholder="Brief description..."
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadForm.file || !uploadForm.title || isUploading}
                    className="btn-gold flex-1 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Add Flyer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
