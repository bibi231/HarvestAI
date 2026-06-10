import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getAllPosts } from '../lib/blog';

export default function Blog() {
  const posts = getAllPosts();

  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="legal-inner">
          <div className="legal-header">
            <span className="legal-eyebrow">Knowledge</span>
            <h1 className="legal-title">HarvestAI Blog</h1>
            <p className="legal-meta">Farming guides, agronomy tips, and AI insights for Nigerian farmers</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 16 }}>
            {posts.map(post => (
              <article key={post.slug} style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 32,
              }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#f5a623',
                      background: 'rgba(245,166,35,0.1)',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>{tag}</span>
                  ))}
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                  <Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>
                  {post.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{new Date(post.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
