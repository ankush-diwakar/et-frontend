import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/etato/Section";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, Loader2, Image as ImageIcon, Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
});

const animProps = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }
};

function BlogRenderer({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith('# {') && line.endsWith('}')) {
      elements.push(<motion.h1 {...animProps} key={`h1-${i}`} className="font-apollonia text-4xl sm:text-5xl leading-tight text-primary mt-12 mb-6 tracking-tight uppercase">{line.slice(3, -1)}</motion.h1>);
      i++;
    } else if (line.startsWith('**{') && line.endsWith('}**')) {
      elements.push(<motion.h2 {...animProps} key={`h2-${i}`} className="font-apollonia text-3xl sm:text-4xl text-primary mt-14 mb-6 tracking-tight uppercase">{line.slice(3, -3)}</motion.h2>);
      i++;
    } else if (line.startsWith('***{') && line.endsWith('}***')) {
      elements.push(<motion.h3 {...animProps} key={`h3-${i}`} className="font-apollonia text-2xl sm:text-3xl text-primary mt-10 mb-4 uppercase">{line.slice(4, -4)}</motion.h3>);
      i++;
    } else if (line === '-{') {
      i++;
      const items = [];
      while (i < lines.length && lines[i].trim() !== '}') {
        if (lines[i].trim()) items.push(lines[i].trim());
        i++;
      }
      elements.push(
        <motion.ul {...animProps} key={`ul-${i}`} className="list-disc pl-5 my-4 space-y-3 marker:text-leaf text-[17px] leading-[1.6] text-charcoal/85 font-light">
          {items.map((item, idx) => <li key={idx} className="pl-2">{item}</li>)}
        </motion.ul>
      );
      i++;
    } else if (line === '+{') {
      i++;
      const items = [];
      while (i < lines.length && lines[i].trim() !== '}') {
        if (lines[i].trim()) items.push(lines[i].trim());
        i++;
      }
      elements.push(
        <motion.ol {...animProps} key={`ol-${i}`} className="list-decimal pl-5 my-4 space-y-3 marker:text-leaf marker:font-semibold text-[17px] leading-[1.6] text-charcoal/85 font-light">
          {items.map((item, idx) => <li key={idx} className="pl-2">{item}</li>)}
        </motion.ol>
      );
      i++;
    } else if (line.startsWith('>{') && line.endsWith('}')) {
      elements.push(
        <motion.blockquote {...animProps} key={`quote-${i}`} className="border-l-4 border-leaf pl-6 my-10 text-charcoal/90 text-2xl font-apollonia leading-snug bg-leaf/5 py-6 pr-6 rounded-r-2xl uppercase">
          "{line.slice(2, -1)}"
        </motion.blockquote>
      );
      i++;
    } else if (line.startsWith('!{')) {
      const title = line.slice(2, line.indexOf('}'));
      i++;
      const paragraphs = [];
      while (i < lines.length && lines[i].trim() !== '') {
        paragraphs.push(lines[i].trim());
        i++;
      }
      elements.push(
        <motion.div {...animProps} key={`important-${i}`} className="bg-amber-50/80 border-l-4 border-amber-500 p-6 my-10 rounded-r-xl">
          <p className="font-bold text-amber-900 flex items-center gap-3 mb-3 font-apollonia text-xl tracking-wide uppercase">
            <span className="text-2xl">⚠️</span> {title}
          </p>
          <div className="space-y-3">
            {paragraphs.map((p, idx) => <p key={idx} className="text-amber-900/90 text-[17px] leading-[1.6] font-light">{p}</p>)}
          </div>
        </motion.div>
      );
    } else if (line.startsWith('i{')) {
      const title = line.slice(2, line.indexOf('}'));
      i++;
      const paragraphs = [];
      while (i < lines.length && lines[i].trim() !== '') {
        paragraphs.push(lines[i].trim());
        i++;
      }
      elements.push(
        <motion.div {...animProps} key={`info-${i}`} className="bg-blue-50/80 border-l-4 border-blue-500 p-6 my-10 rounded-r-xl">
          <p className="font-bold text-blue-900 flex items-center gap-3 mb-3 font-apollonia text-xl tracking-wide uppercase">
            <span className="text-2xl">ℹ️</span> {title}
          </p>
          <div className="space-y-3">
            {paragraphs.map((p, idx) => <p key={idx} className="text-blue-900/90 text-[17px] leading-[1.6] font-light">{p}</p>)}
          </div>
        </motion.div>
      );
    } else if (line.startsWith('!!{')) {
      const title = line.slice(3, line.indexOf('}'));
      i++;
      const paragraphs = [];
      while (i < lines.length && lines[i].trim() !== '') {
        paragraphs.push(lines[i].trim());
        i++;
      }
      elements.push(
        <motion.div {...animProps} key={`warning-${i}`} className="bg-red-50/80 border-l-4 border-red-500 p-6 my-10 rounded-r-xl">
          <p className="font-bold text-red-900 flex items-center gap-3 mb-3 font-apollonia text-xl tracking-wide uppercase">
            <span className="text-2xl">🛑</span> {title}
          </p>
          <div className="space-y-3">
            {paragraphs.map((p, idx) => <p key={idx} className="text-red-900/90 text-[17px] leading-[1.6] font-light">{p}</p>)}
          </div>
        </motion.div>
      );
    } else if (line === 'img{') {
      i++;
      const imgLines = [];
      while (i < lines.length && lines[i].trim() !== '}') {
        imgLines.push(lines[i].trim());
        i++;
      }
      const url = imgLines[0];
      const caption = imgLines.slice(1).join(' ');
      elements.push(
        <motion.figure {...animProps} key={`img-${i}`} className="my-12">
          <img src={url} alt={caption} className="w-full rounded-2xl shadow-lg object-cover max-h-[600px] transition-transform hover:scale-[1.01] duration-700" />
          {caption && <figcaption className="text-center text-[13px] text-muted-foreground mt-4 font-apollonia italic tracking-wide">{caption}</figcaption>}
        </motion.figure>
      );
      i++;
    } else if (line === 'table{') {
      i++;
      const tableLines = [];
      while (i < lines.length && lines[i].trim() !== '}') {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length > 0) {
        const headers = tableLines[0].split('|').map(s => s.trim());
        const rows = tableLines.slice(1).map(row => row.split('|').map(s => s.trim()));
        elements.push(
          <motion.div {...animProps} key={`table-${i}`} className="overflow-x-auto my-12 rounded-xl border border-border/60 shadow-sm bg-white">
            <table className="w-full text-left border-collapse text-[15px]">
              <thead className="bg-leaf/5">
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="border-b-2 border-border/60 p-4 font-semibold text-primary font-apollonia tracking-wide uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cream/40 transition-colors">
                    {row.map((cell, cidx) => (
                      <td key={cidx} className="p-4 align-top text-charcoal/80 font-light">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        );
      }
      i++;
    } else if (line === '---') {
      elements.push(
        <motion.hr 
          initial={{ opacity: 0, scaleX: 0 }} 
          whileInView={{ opacity: 1, scaleX: 1 }} 
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          key={`hr-${i}`} 
          className="my-16 border-t-2 border-[#0A3D24]/30 w-1/2 mx-auto origin-center" 
        />
      );
      i++;
    } else if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const code = codeLines.join('\n');
      elements.push(
        <motion.div {...animProps} key={`code-${i}`} className="my-8 relative rounded-2xl overflow-hidden bg-[#1e1e1e] shadow-xl">
          {language && (
            <div className="flex items-center px-5 py-3 bg-black/40 text-xs text-white/50 border-b border-white/10 uppercase tracking-widest font-semibold">
              {language}
            </div>
          )}
          <pre className="p-5 overflow-x-auto text-[14px] text-gray-300 font-mono leading-relaxed">
            <code>{code}</code>
          </pre>
        </motion.div>
      );
      i++;
    } else {
      // Regular paragraph
      const pLines = [];
      while (i < lines.length) {
        const checkLine = lines[i].trim();
        if (!checkLine) break; 
        
        // Check if next line is a tag
        if (checkLine.startsWith('# {') || checkLine.startsWith('**{') || checkLine.startsWith('***{') ||
            checkLine === '-{' || checkLine === '+{' || checkLine.startsWith('>{') ||
            checkLine.startsWith('!{') || checkLine.startsWith('i{') || checkLine.startsWith('!!{') ||
            checkLine === 'img{' || checkLine === 'table{' || checkLine === '---' || checkLine.startsWith('```')) {
          break;
        }
        pLines.push(checkLine);
        i++;
      }
      if (pLines.length > 0) {
        elements.push(<motion.p {...animProps} key={`p-${i}`} className="my-4 leading-[1.6] text-[17px] text-charcoal/85 font-light tracking-wide">{pLines.join(' ')}</motion.p>);
      }
    }
  }

  return <>{elements}</>;
}

function PostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    api<{ post: any, nextPost: any }>(`/blog/${slug}`)
      .then((data) => {
        setPost(data.post);
        document.title = `${data.post.title} — Etato Foods`;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-apollonia text-4xl text-primary uppercase">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-cream">
      {/* Full width hero image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full h-[45vh] sm:h-[65vh] bg-charcoal flex items-center justify-center overflow-hidden"
      >
        {/* Back Button Aligned to Content Width */}
        <div className="absolute inset-0 z-20 pointer-events-none flex pt-6 sm:pt-10">
          <div className="mx-auto px-4 w-full w-[80%] lg:w-[65%] pointer-events-auto flex items-start">
            <Link to="/blog" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/60 transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/10">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
          </div>
        </div>
        
        {post.coverUrl ? (
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={post.coverUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-leaf/20">
            <ImageIcon className="h-24 w-24 sm:h-32 sm:w-32 text-leaf opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
      </motion.div>

      {/* Content below image */}
      <div className="mx-auto px-4 py-12 sm:py-20 w-[80%] lg:w-[65%]">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-14 sm:mb-20 text-center"
        >
          <p className="text-[12px] font-bold tracking-[0.25em] uppercase text-leaf mb-5">{post.category || "General"}</p>
          <h1 className="font-apollonia text-5xl sm:text-7xl leading-[1.1] text-[#0A3D24] mb-6 tracking-wide uppercase">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-[15px] text-muted-foreground font-medium uppercase tracking-wider">
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>·</span>
            <span>{post.readTime || "5 min read"}</span>
          </div>
        </motion.header>

        <div className="text-charcoal/85">
          <BlogRenderer content={post.body} />
        </div>
        
        {/* Share, Tags & Like */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-8"
        >
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <span className="text-xs font-semibold px-4 py-2 rounded-full bg-white shadow-sm border border-border/40 text-[#0A3D24] tracking-wide uppercase">#{post.category?.toLowerCase() || "nutrition"}</span>
            <span className="text-xs font-semibold px-4 py-2 rounded-full bg-white shadow-sm border border-border/40 text-[#0A3D24] tracking-wide uppercase">#etatofoods</span>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="text-xs font-semibold text-[#0A3D24] hover:text-[#0A3D24]/70 transition-colors flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-sm border border-border/40 uppercase tracking-widest"
            >
              Share Article
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="group flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border border-border/40 hover:bg-red-50 transition-colors"
            >
              <Heart className={`h-5 w-5 transition-all duration-300 ${liked ? "fill-red-500 text-red-500 scale-110" : "text-[#0A3D24]/70 group-hover:text-red-400 group-hover:scale-105"}`} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Hungry for more banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full mt-10"
      >
        <Link to="/blog" className="block w-full bg-[#D5EDC4] py-24 px-4 text-center group border-b-[32px] border-[#0A3D24]">
          <p className="text-[#0A3D24] font-bold tracking-wide text-lg sm:text-xl mb-4">Hungry for more?</p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 overflow-hidden px-4">
            <h2 className="font-apollonia text-4xl sm:text-6xl md:text-8xl text-[#0A3D24] tracking-wider uppercase transition-transform group-hover:scale-105">
              BACK TO ARTICLES
            </h2>
            <svg 
              className="w-16 sm:w-32 md:w-48 text-[#0A3D24] transition-transform group-hover:translate-x-4" 
              viewBox="0 0 100 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 10H98M98 10L88 2M98 10L88 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </Link>
      </motion.div>
    </article>
  );
}
