import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { api, API_BASE, getAccessToken } from "@/lib/api";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogPage,
});

function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api<{ posts: any[] }>("/admin/blog");
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post?: any) => {
    if (post) {
      setEditingId(post.id);
      setFormData({
        title: post.title,
        excerpt: post.excerpt || "",
        body: post.body,
        category: post.category || "",
        status: post.status,
      });
    } else {
      setEditingId("new");
      setFormData({
        title: "",
        excerpt: "",
        body: "",
        category: "",
        status: "DRAFT",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId && editingId !== "new") {
        await api(`/admin/blog/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await api("/admin/blog", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      toast.success("Post saved successfully");
      await fetchPosts();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this blog post? This action cannot be undone.")) return;
    try {
      await api(`/admin/blog/${id}`, { method: "DELETE" });
      toast.success("Post deleted successfully");
      await fetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    const toastId = toast.loading("Uploading cover image...");

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/admin/blog/${id}/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Image uploaded successfully", { id: toastId });
      await fetchPosts();
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary">Blog CMS</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage articles, updates, and nutrition tips.</p>
        </div>
        {!editingId && (
          <button
            onClick={() => handleEdit()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> New Post
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">{error}</div>}

      {/* Editor Form */}
      {editingId && (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-2xl border border-border shadow-soft space-y-6">
          <h3 className="font-display text-xl">{editingId === "new" ? "Create New Post" : "Edit Post"}</h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
              <input required minLength={5} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="admin-input font-display text-lg" placeholder="Post Title" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="admin-input" placeholder="e.g. Nutrition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="admin-input">
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Excerpt (Short Summary)</label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="admin-input min-h-[60px]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Body (Markdown Supported)</span>
                <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-leaf flex items-center gap-1 hover:underline">
                  Syntax Guide <ExternalLink className="h-3 w-3" />
                </a>
              </label>
              <textarea required minLength={10} value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} className="admin-input font-mono text-sm min-h-[300px]" placeholder="## Heading&#10;Write your post content here..." />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : "Save Post"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-5 py-2 bg-muted text-muted-foreground font-semibold rounded-lg text-sm hover:bg-muted/80">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft flex flex-col">
            <div className="relative h-40 bg-muted group">
              {post.coverUrl ? (
                <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                  <span className="text-xs font-medium">No Cover</span>
                </div>
              )}

              {/* Image Upload Overlay */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-semibold bg-primary px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" /> Upload Cover
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(post.id, e.target.files[0])}
                />
              </label>

              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${post.status === 'PUBLISHED' ? 'bg-leaf text-white' :
                    post.status === 'DRAFT' ? 'bg-muted text-muted-foreground' :
                      'bg-destructive text-white'
                  }`}>{post.status}</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <p className="text-[10px] text-leaf font-bold uppercase tracking-wider mb-1">{post.category || "Uncategorized"}</p>
              <h3 className="font-display text-lg leading-tight line-clamp-2 mb-2" title={post.title}>{post.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{post.excerpt || "No excerpt provided."}</p>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <button onClick={() => handleEdit(post)} className="flex-1 py-2 bg-mint text-primary text-xs font-semibold rounded-lg hover:bg-mint/80 transition-colors">
                  Edit Post
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-2 text-muted-foreground hover:text-destructive bg-muted rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No blog posts yet. Create your first one!</p>
          </div>
        )}
      </div>

      <style>{`
        .admin-input {
          width: 100%; padding: 0.6rem 0.75rem; border-radius: 0.5rem;
          border: 1px solid var(--color-border); background: var(--color-background);
          color: var(--color-primary);
        }
        .admin-input:focus { outline: 2px solid var(--color-leaf); outline-offset: -1px; }
      `}</style>
    </div>
  );
}
