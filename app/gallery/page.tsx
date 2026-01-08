"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  _count: { flyers: number };
}

interface Flyer {
  id: string;
  code: string;
  title: string;
  description?: string;
  imageUrl: string;
  subcategory: {
    id: string;
    name: string;
    category: { id: string; name: string };
  };
}

interface User {
  id: string;
  email: string;
}

export default function GalleryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchFlyers(selectedSubcategory);
    } else if (selectedCategory) {
      fetchFlyersByCategory(selectedCategory);
    } else {
      fetchAllFlyers();
    }
  }, [selectedCategory, selectedSubcategory]);

  const fetchData = async () => {
    try {
      const [categoriesRes, userRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/auth/me"),
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories);
        // Select first category by default
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllFlyers = async () => {
    try {
      const res = await fetch("/api/flyers");
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    }
  };

  const fetchFlyersByCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/flyers?categoryId=${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    }
  };

  const fetchFlyers = async (subcategoryId: string) => {
    try {
      const res = await fetch(`/api/flyers?subcategoryId=${subcategoryId}`);
      if (res.ok) {
        const data = await res.json();
        setFlyers(data.flyers);
      }
    } catch (error) {
      console.error("Error fetching flyers:", error);
    }
  };

  const openModal = async (flyer: Flyer) => {
    setSelectedFlyer(flyer);
    setRequestMessage("");
    setSubmitSuccess(false);

    try {
      await fetch(`/api/flyers/${flyer.id}/view`, { method: "POST" });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const closeModal = () => {
    setSelectedFlyer(null);
    setRequestMessage("");
    setSubmitSuccess(false);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlyer) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/flyers/${selectedFlyer.id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMessage }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setRequestMessage("");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-vault-text-muted">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-black">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">
            Promo<span className="text-gradient">Vault</span>
          </h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-vault-text-muted text-sm">
                {user.email}
              </span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="btn-ghost text-sm py-2 px-4"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-gold-500 text-vault-black"
                    : "bg-vault-gray text-vault-text hover:bg-vault-muted"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Pills */}
        {currentCategory && currentCategory.subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedSubcategory
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "bg-vault-gray text-vault-text-muted hover:text-white"
                }`}
              >
                All {currentCategory.name}
              </button>
              {currentCategory.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSubcategory === sub.id
                      ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                      : "bg-vault-gray text-vault-text-muted hover:text-white"
                  }`}
                >
                  {sub.name}
                  <span className="ml-2 text-xs opacity-60">
                    ({sub._count.flyers})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {flyers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-vault-text-muted text-lg">
              No items in this category yet.
            </p>
          </div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${selectedSubcategory}`}
            variants={container}
            initial="hidden"
            animate="show"
            className="masonry-grid"
          >
            {flyers.map((flyer) => (
              <motion.div
                key={flyer.id}
                variants={item}
                className="masonry-item"
              >
                <button
                  onClick={() => openModal(flyer)}
                  className="flyer-card w-full text-left group"
                >
                  <div className="relative">
                    <img
                      src={flyer.imageUrl}
                      alt={flyer.title}
                      className="w-full rounded-xl"
                    />
                    <div className="absolute top-3 right-3 badge-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {flyer.code}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-vault-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-gold-400 text-xs mb-1">
                        {flyer.subcategory.category.name} / {flyer.subcategory.name}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-white truncate">
                        {flyer.title}
                      </h3>
                      <p className="text-vault-text-muted text-sm">{flyer.code}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedFlyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:w-1/2 relative bg-vault-dark">
                <img
                  src={selectedFlyer.imageUrl}
                  alt={selectedFlyer.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gold-400 text-xs mb-2">
                      {selectedFlyer.subcategory.category.name} / {selectedFlyer.subcategory.name}
                    </p>
                    <span className="badge-gold mb-2 inline-block">
                      {selectedFlyer.code}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white">
                      {selectedFlyer.title}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-vault-text-muted hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedFlyer.description && (
                  <p className="text-vault-text-muted mb-6">
                    {selectedFlyer.description}
                  </p>
                )}

                <div className="flex-1" />

                <div className="border-t border-vault-border pt-6">
                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="font-display text-xl font-semibold text-white mb-2">
                        Request Submitted!
                      </h4>
                      <p className="text-vault-text-muted">
                        We'll be in touch about <span className="text-gold-400">{selectedFlyer.code}</span>
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <h4 className="font-display text-lg font-semibold text-white mb-4">
                        Request This Item
                      </h4>
                      <form onSubmit={handleRequest} className="space-y-4">
                        <div>
                          <label className="block text-sm text-vault-text-muted mb-2">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            className="input-dark resize-none h-24"
                            placeholder="Any special requirements..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-gold w-full disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Request"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
