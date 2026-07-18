import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { api, API_BASE, getAccessToken } from "@/lib/api";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Bowl } from "@/data/menu";

export const Route = createFileRoute("/admin/menu")({
  component: AdminMenuPage,
});

function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        api<{ items: any[] }>("/admin/menu"),
        api<{ categories: any[] }>("/admin/categories"),
      ]);
      setItems(menuRes.items);
      setCategories(catRes.categories);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        dressing: item.dressing,
        categoryId: item.categoryId,
        protein: item.protein || "",
        calories: item.calories || "",
        carbs: item.carbs || "",
        fat: item.fat || "",
        fiber: item.fiber || "",
        ingredients: item.ingredients.join(", "),
        price: item.price || "",
        jain: Boolean(item.jain),
        status: item.status,
        isFeatured: Boolean(item.isFeatured),
        sortOrder: Number(item.sortOrder) || 0,
      });
    } else {
      setEditingId("new");
      setFormData({
        name: "",
        dressing: "",
        categoryId: categories[0]?.id || "",
        protein: "",
        calories: "",
        carbs: "",
        fat: "",
        fiber: "",
        ingredients: "",
        price: "",
        jain: false,
        status: "ACTIVE",
        isFeatured: false,
        sortOrder: 0,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // transform data
    const payload = { ...formData };
    payload.ingredients = payload.ingredients.split(",").map((i: string) => i.trim()).filter(Boolean);
    payload.price = payload.price ? parseFloat(payload.price) : null;
    payload.jain = Boolean(payload.jain);
    payload.isFeatured = Boolean(payload.isFeatured);
    payload.sortOrder = Number(payload.sortOrder) || 0;
    if (!payload.protein) payload.protein = null;
    if (!payload.calories) payload.calories = null;
    if (!payload.carbs) payload.carbs = null;
    if (!payload.fat) payload.fat = null;
    if (!payload.fiber) payload.fiber = null;

    try {
      if (editingId && editingId !== "new") {
        await api(`/admin/menu/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Menu item updated successfully");
      } else {
        await api("/admin/menu", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Menu item created successfully");
      }
      await fetchData();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Soft delete this item? It will be marked INACTIVE.")) return;
    try {
      await api(`/admin/menu/${id}`, { method: "DELETE" });
      toast.success("Menu item marked as INACTIVE");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this item? This cannot be undone.")) return;
    try {
      await api(`/admin/menu/${id}/permanent`, { method: "DELETE" });
      toast.success("Menu item permanently deleted");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const toastId = toast.loading("Uploading image...");

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/admin/menu/${id}/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Image uploaded successfully", { id: toastId });
      await fetchData();
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary">Menu Items</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage bowls, beverages, and their details.</p>
        </div>
        {!editingId && (
          <button
            onClick={() => handleEdit()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">{error}</div>}

      {/* Form */}
      {editingId && (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-2xl border border-border shadow-soft space-y-6">
          <h3 className="font-display text-xl">{editingId === "new" ? "New Menu Item" : "Edit Menu Item"}</h3>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dressing</label>
              <input required value={formData.dressing} onChange={(e) => setFormData({ ...formData, dressing: e.target.value })} className="admin-input" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="admin-input">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
              <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="admin-input" placeholder="Leave empty if TBD" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredients (Comma separated)</label>
              <textarea required value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} className="admin-input min-h-[80px]" />
            </div>

            {/* Macros */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Protein (e.g. 25-30g)</label>
              <input value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calories</label>
              <input value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carbs</label>
              <input value={formData.carbs} onChange={(e) => setFormData({ ...formData, carbs: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
              <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="admin-input">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
                <option value="COMING_SOON">Coming Soon</option>
                <option value="NOT_AVAILABLE">Not Available</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={formData.jain} onChange={(e) => setFormData({ ...formData, jain: e.target.checked })} className="rounded border-border text-leaf focus:ring-leaf w-4 h-4" />
              Jain Option Available
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded border-border text-leaf focus:ring-leaf w-4 h-4" />
              Featured
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : "Save Item"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-5 py-2 bg-muted text-muted-foreground font-semibold rounded-lg text-sm hover:bg-muted/80">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft flex flex-col">
            <div className="relative h-48 bg-muted group">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8 opacity-20" /></div>
              )}

              {/* Image Upload Overlay */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-semibold bg-primary px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" /> Upload Image
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(item.id, e.target.files[0])}
                />
              </label>

              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${item.status === 'ACTIVE' ? 'bg-leaf text-white' :
                  item.status === 'COMING_SOON' ? 'bg-amber-500 text-white' :
                    item.status === 'INACTIVE' ? 'bg-destructive text-white' :
                      'bg-muted text-muted-foreground'
                  }`}>{item.status.replace("_", " ")}</span>
                {item.jain && <span className="bg-gold text-white text-[10px] font-bold px-2 py-1 rounded-full">JAIN</span>}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-display text-lg leading-tight truncate">{item.name}</h3>
                <span className="font-semibold text-price text-sm shrink-0 ml-2">
                  {item.price ? `₹${item.price}` : "TBD"}
                </span>
              </div>
              <p className="text-xs text-leaf font-bold uppercase tracking-wider mb-2">{item.category?.name}</p>

              <div className="mt-auto pt-4 flex gap-2">
                <button onClick={() => handleEdit(item)} className="flex-1 py-2 bg-mint text-primary text-xs font-semibold rounded-lg hover:bg-mint/80 transition-colors">
                  Edit Details
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-destructive bg-muted rounded-lg transition-colors" title="Soft delete">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => handlePermanentDelete(item.id)} className="p-2 text-destructive hover:text-destructive/80 bg-destructive/10 rounded-lg transition-colors" title="Delete permanently">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .admin-input {
          width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem;
          border: 1px solid var(--color-border); background: var(--color-background);
          font-size: 0.875rem; color: var(--color-primary);
        }
        .admin-input:focus { outline: 2px solid var(--color-leaf); outline-offset: -1px; }
      `}</style>
    </div>
  );
}
