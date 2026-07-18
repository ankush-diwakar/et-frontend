import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", sortOrder: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { categories } = await api<{ categories: Category[] }>("/admin/categories");
      setCategories(categories);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, sortOrder: cat.sortOrder, isActive: cat.isActive });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", sortOrder: 0, isActive: true });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId && editingId !== "new") {
        await api(`/admin/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Category updated successfully");
      } else {
        await api("/admin/categories", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Category created successfully");
      }
      await fetchCategories();
      handleCancelEdit();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category? This will fail if menu items are still attached.")) return;
    try {
      await api(`/admin/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted successfully");
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const toggleStatus = async (cat: Category) => {
    try {
      await api(`/admin/categories/${cat.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !cat.isActive } : c))
      );
      toast.success(`Category ${!cat.isActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary">Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage menu categories and their display order.</p>
        </div>
        {!editingId && (
          <button
            onClick={() => setEditingId("new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form (Create/Edit) */}
      {editingId && (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-2xl border border-border shadow-soft space-y-4">
          <h3 className="font-display text-lg">{editingId === "new" ? "New Category" : "Edit Category"}</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Smoothies"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort Order</label>
              <input
                type="number"
                required
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-border text-leaf focus:ring-leaf w-4 h-4"
              />
              Active (Visible on Menu)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2 bg-muted text-muted-foreground font-semibold rounded-lg text-sm hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-mint/30 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-mint/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{cat.sortOrder}</td>
                  <td className="px-6 py-4 font-semibold text-primary">{cat.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(cat)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        cat.isActive ? "bg-leaf/10 text-leaf" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.isActive ? <><Check className="h-3 w-3" /> Active</> : <><X className="h-3 w-3" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No categories found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
