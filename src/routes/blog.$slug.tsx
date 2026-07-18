import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/etato/Section";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<any>(null);
  const [nextPost, setNextPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api<{ post: any, nextPost: any }>(`/blog/${slug}`)
      .then((data) => {
        setPost(data.post);
        setNextPost(data.nextPost);
        // update doc title dynamically
        document.title = `${data.post.title} — Etato Foods`;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-4xl text-primary">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article>
      <header className="bg-mint">
        <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-leaf hover:underline">
            <ArrowLeft className="h-4 w-4" /> All stories
          </Link>
          <p className="mt-6 text-[10px] font-bold tracking-[0.25em] uppercase text-leaf">{post.category || "General"}</p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl leading-tight text-primary">{post.title}</h1>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10">
        <div className="aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-card bg-cream border flex items-center justify-center">
          {post.coverUrl ? (
            <img
              src={post.coverUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-24 w-24 text-leaf opacity-20" />
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="prose prose-lg prose-leaf max-w-none text-charcoal/80">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>

        {/* Share & Tags */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-mint text-leaf">#{post.category?.toLowerCase() || "nutrition"}</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-mint text-leaf">#etatofoods</span>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="text-sm font-semibold text-primary hover:text-leaf transition-colors"
          >
            Share Article
          </button>
        </div>
      </div>

      {nextPost && (
        <Section bg="mint">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-leaf mb-4">Read Next</p>
            <h2 className="font-display text-3xl sm:text-5xl text-primary">{nextPost.title}</h2>
            <Link
              to="/blog/$slug"
              params={{ slug: nextPost.slug }}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-card"
            >
              Read Article <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      )}
    </article>
  );
}
