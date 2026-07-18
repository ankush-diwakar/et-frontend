import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/etato/Section";
import { api } from "@/lib/api";
import { ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Etato Foods · Nutrition, Stories & Kitchen Notes" },
      { name: "description", content: "Stories from our Katraj kitchen — nutrition guides, ingredient deep-dives, and tips for a healthier Indian diet." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ posts: any[] }>("/blog")
      .then((data) => setPosts(data.posts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;
  if (error) return <div className="text-center py-32 text-destructive">{error}</div>;

  const [featured, ...rest] = posts;

  return (
    <>
      <section className="bg-[#0A472E]">
        <div className="container mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9D909] mb-3">
            The Etato Journal
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-white leading-tight">
            Notes from the <span className="text-[#C9D909]">kitchen.</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 font-light">
            Real talk on nutrition, ingredients and what it takes to put a fresh bowl on your table.
          </p>
        </div>
      </section>

      <Section bg="default">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
            No blog posts published yet. Check back soon!
          </div>
        ) : (
          <>
            {/* Featured */}
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group grid lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-card rounded-3xl overflow-hidden border border-border shadow-soft hover:shadow-card transition-all"
            >
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden bg-mint flex items-center justify-center">
                {featured.coverUrl ? (
                  <img src={featured.coverUrl} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-leaf opacity-20" />
                )}
              </div>
              <div className="p-6 sm:p-10">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-leaf">
                  Featured · {featured.category || "General"}
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-4xl leading-tight text-primary">
                  {featured.title}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(featured.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-leaf group-hover:text-primary transition-colors">
                  Read Article <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Grid */}
            {rest.length > 0 && (
              <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-card transition-all"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-mint flex items-center justify-center">
                      {post.coverUrl ? (
                        <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-leaf opacity-20" />
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-leaf">
                        {post.category || "General"}
                      </span>
                      <h3 className="mt-2 font-display text-xl leading-snug text-primary group-hover:text-leaf transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      <div className="mt-auto pt-5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
