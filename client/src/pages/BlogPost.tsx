import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navbar } from '../components/Navbar';
import { getPostBySlug } from '../lib/blog';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="legal-inner">
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
            ← All posts
          </Link>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: '#f5a623', background: 'rgba(245,166,35,0.1)', padding: '2px 8px', borderRadius: 4,
              }}>{tag}</span>
            ))}
          </div>

          <h1 className="legal-title" style={{ fontSize: 'clamp(22px, 5vw, 30px)', lineHeight: 1.2 }}>{post.title}</h1>

          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '12px 0 40px' }}>
            <span>{post.author}</span><span>·</span>
            <span>{new Date(post.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span><span>{post.readingTime} min read</span>
          </div>

          <div className="hai-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          <div style={{
            marginTop: 64, padding: 32, background: 'rgba(245,166,35,0.06)',
            borderRadius: 12, border: '1px solid rgba(245,166,35,0.2)', textAlign: 'center',
          }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
              Extract leads and data from any website in seconds
            </p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginBottom: 24 }}>
              HarvestAI scrapes, structures, and exports B2B data for Nigerian businesses — leads, prices, contacts, and more.
            </p>
            <Link to="/" style={{
              display: 'inline-block', background: '#f5a623', color: '#000',
              fontWeight: 700, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 15,
            }}>
              Try HarvestAI free →
            </Link>
          </div>

          <div style={{ marginTop: 40 }}>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none' }}>
              ← Back to all posts
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        .hai-prose { color: rgba(255,255,255,0.65); font-size: 16px; line-height: 1.75; }
        .hai-prose h2 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; color: #fff; margin: 40px 0 12px; }
        .hai-prose h3 { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 18px; color: #fff; margin: 28px 0 10px; }
        .hai-prose p { margin-bottom: 18px; }
        .hai-prose a { color: #f5a623; }
        .hai-prose strong { color: #fff; }
        .hai-prose ul, .hai-prose ol { padding-left: 24px; margin-bottom: 18px; }
        .hai-prose li { margin-bottom: 6px; }
        .hai-prose code { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 14px; }
        .hai-prose pre { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; overflow-x: auto; margin-bottom: 24px; }
        .hai-prose pre code { background: none; padding: 0; }
        .hai-prose table { display: block; overflow-x: auto; width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 15px; }
        .hai-prose th { text-align: left; padding: 10px 14px; background: rgba(255,255,255,0.06); color: #fff; font-weight: 600; }
        .hai-prose td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .hai-prose blockquote { border-left: 3px solid #f5a623; padding-left: 16px; margin: 0 0 18px; color: rgba(255,255,255,0.5); font-style: italic; }
        @media (max-width: 640px) {
          .hai-prose { font-size: 15px; }
          .hai-prose h2 { font-size: 19px; }
          .hai-prose h3 { font-size: 16px; }
          .hai-prose table { font-size: 13px; }
          .hai-prose th, .hai-prose td { padding: 8px 10px; }
        }
      `}</style>
    </div>
  );
}
