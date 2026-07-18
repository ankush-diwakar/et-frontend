import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Mail, Check, Reply, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContactsPage,
});

function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await api<{ contacts: any[] }>("/admin/contacts");
      setContacts(data.contacts);
    } catch (err) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api(`/admin/contacts/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ replyText }),
      });
      setReplyText("");
      setReplyingId(null);
      toast.success("Reply saved successfully");
      await fetchContacts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save reply");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api(`/admin/contacts/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ markRead: true }),
      });
      toast.success("Marked as read");
      await fetchContacts();
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary flex items-center gap-2">
          <Mail className="h-6 w-6 text-leaf" /> Contact Submissions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Review and reply to user inquiries.</p>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className={`bg-card rounded-2xl border ${contact.isRead ? "border-border" : "border-leaf/30 shadow-soft"} overflow-hidden`}>
            <div className={`p-4 sm:p-6 ${contact.isRead ? "" : "bg-mint/10"}`}>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    {!contact.isRead && <span className="bg-leaf text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.email} · {contact.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {new Date(contact.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2 items-start">
                  {!contact.isRead && (
                    <button onClick={() => handleMarkRead(contact.id)} className="px-3 py-1.5 bg-mint text-leaf text-xs font-semibold rounded-lg hover:bg-leaf hover:text-white transition-colors flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Mark Read
                    </button>
                  )}
                  <button onClick={() => {
                    setReplyingId(replyingId === contact.id ? null : contact.id);
                    setReplyText("");
                  }} className="px-3 py-1.5 bg-background border border-border text-primary text-xs font-semibold rounded-lg hover:bg-mint transition-colors flex items-center gap-1.5">
                    <Reply className="h-3.5 w-3.5" /> {contact.adminNote ? "Edit Note" : "Add Note / Reply"}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-background rounded-xl border border-border/50">
                <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
              </div>

              {contact.adminNote && replyingId !== contact.id && (
                <div className="mt-4 p-4 bg-mint/20 border-l-2 border-leaf rounded-r-xl">
                  <p className="text-xs font-bold text-leaf uppercase tracking-wider mb-1">Admin Note / Reply ({new Date(contact.repliedAt).toLocaleDateString()})</p>
                  <p className="text-sm whitespace-pre-wrap">{contact.adminNote}</p>
                </div>
              )}

              {replyingId === contact.id && (
                <form onSubmit={(e) => handleReply(e, contact.id)} className="mt-4 space-y-3">
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    placeholder="Type your internal note or reply record here..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf min-h-[100px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setReplyingId(null)} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-leaf text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
                      {saving ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ))}

        {contacts.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            No contact submissions yet.
          </div>
        )}
      </div>
    </div>
  );
}
