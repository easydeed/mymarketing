"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  _count: { flyers: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  subcategories: Subcategory[];
  _count: { subcategories: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        await fetchCategories();
        setShowCategoryModal(false);
        setCategoryForm({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategoryId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subcategoryForm),
      });
      if (res.ok) {
        await fetchCategories();
        setShowSubcategoryModal(false);
        setSubcategoryForm({ name: "" });
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryActive = async (category: Category) => {
    try {
      await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !category.active }),
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling category:", error);
    }
  };

  const toggleSubcategoryActive = async (categoryId: string, subcategoryId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling subcategory:", error);
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-white">Categories</h1>
          <p className="text-vault-text-muted mt-1">Manage categories and subcategories</p>
        </motion.div>
        <button onClick={() => setShowCategoryModal(true)} className="btn-gold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl overflow-hidden"
          >
            {/* Category Header */}
            <div className="p-6 flex items-center justify-between border-b border-vault-border">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">{category.name}</h2>
                {category.description && (
                  <p className="text-vault-text-muted text-sm mt-1">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setShowSubcategoryModal(true);
                  }}
                  className="btn-ghost text-sm py-2"
                >
                  + Add Subcategory
                </button>
                <button
                  onClick={() => toggleCategoryActive(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    category.active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-vault-muted text-vault-text-muted"
                  }`}
                >
                  {category.active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="p-4">
              {category.subcategories.length === 0 ? (
                <p className="text-vault-text-muted text-center py-4">No subcategories yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-vault-dark rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{sub.name}</p>
                        <p className="text-vault-text-muted text-xs">{sub._count.flyers} items</p>
                      </div>
                      <button
                        onClick={() => toggleSubcategoryActive(category.id, sub.id, sub.active)}
                        className={`w-3 h-3 rounded-full ${
                          sub.active ? "bg-green-400" : "bg-vault-border"
                        }`}
                        title={sub.active ? "Active" : "Inactive"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-semibold text-white mb-6">Add Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="input-dark"
                    placeholder="e.g., Brochures"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">Description</label>
                  <textarea
                    className="input-dark resize-none h-20"
                    placeholder="Optional description..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-gold flex-1 disabled:opacity-50">
                    {isSaving ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Subcategory Modal */}
      <AnimatePresence>
        {showSubcategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubcategoryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-semibold text-white mb-6">Add Subcategory</h2>
              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <div>
                  <label className="block text-sm text-vault-text-muted mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="input-dark"
                    placeholder="e.g., Luxury Homes"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ name: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowSubcategoryModal(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-gold flex-1 disabled:opacity-50">
                    {isSaving ? "Adding..." : "Add Subcategory"}
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

