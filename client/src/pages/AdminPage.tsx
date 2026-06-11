import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

const PLATFORM_ADMINS = ['peterjohn2343@gmail.com', 'bitrusgadzama02@gmail.com', 'bitrus@trueweb.ng'];

type Tab = 'overview' | 'blog' | 'users';
type PlatformRole = 'super_admin' | 'admin' | 'editor';

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; content: string;
  author: string; tags: string[]; readingTime: number; published: boolean; createdAt: string;
}

interface AdminUser {
  id: string; email: string; displayName: string | null; platformRole: PlatformRole | null;
  paidCredits: number; freeCreditsUsed: number; createdAt: string;
}

interface Stats {
  totalUsers: number; totalJobs: number; totalCreditsRevenue: number;
  newUsersThisWeek: number; jobsThisWeek: number; recentUsers: AdminUser[];
}

function localRole(email: string): PlatformRole {
  return PLATFORM_ADMINS.includes(email) ? 'super_admin' : 'editor';
}

function RoleBadge({ role }: { role: PlatformRole | null }) {
  if (!role) return <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>—</span>;
  const colors: Record<PlatformRole, string> = { super_admin: '#a78bfa', admin: '#f5a623', editor: '#34d399' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors[role], background: `${colors[role]}1a`, padding: '2px 8px', borderRadius: 4 }}>
      {role.replace('_', ' ')}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.1)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, color: '#fff' }}>{value}</div>
    </div>
  );
}

const BLANK: Partial<BlogPost> = { title: '', slug: '', excerpt: '', content: '', author: 'HarvestAI Team', tags: [], readingTime: 5, published: false };

export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState<Partial<BlogPost> | null>(null);
  const [mdPreview, setMdPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const myRole: PlatformRole | null = user?.email ? localRole(user.email) : null;
  const isSuperAdmin = myRole === 'super_admin';
  const canEdit = !!myRole;

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!canEdit) { navigate('/'); return; }
    api.get<{ success: boolean; data: Stats }>('/api/admin/stats')
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, [user]);

  const loadPosts = useCallback(() => {
    api.get<{ data: BlogPost[] }>('/api/admin/blog').then(r => setPosts(r.data.data));
  }, []);

  const loadUsers = useCallback(() => {
    api.get<{ data: AdminUser[] }>('/api/admin/users').then(r => setAdminUsers(r.data.data));
  }, []);

  useEffect(() => { if (tab === 'blog') loadPosts(); }, [tab]);
  useEffect(() => { if (tab === 'users' && isSuperAdmin) loadUsers(); }, [tab]);

  async function savePost() {
    if (!editPost?.title || !editPost.slug || !editPost.content) { setMsg('Title, slug, and content required.'); return; }
    setSaving(true); setMsg('');
    try {
      editPost.id ? await api.put(`/api/admin/blog/${editPost.id}`, editPost) : await api.post('/api/admin/blog', editPost);
      setEditPost(null); loadPosts(); setMsg('Post saved.');
    } catch { setMsg('Save failed.'); }
    finally { setSaving(false); }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/api/admin/blog/${id}`);
    loadPosts();
  }

  async function setUserRole(uid: string, role: PlatformRole | null) {
    await api.patch(`/api/admin/users/${uid}/role`, { role });
    loadUsers();
  }

  const accent = '#f5a623';
  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'overview', label: 'Overview', show: true },
    { key: 'blog', label: 'Blog Posts', show: canEdit },
    { key: 'users', label: 'Users & Roles', show: isSuperAdmin },
  ];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '100px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, margin: 0 }}>Platform Admin</h1>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            HarvestAI <RoleBadge role={myRole} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.filter(t => t.show).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setMsg(''); setEditPost(null); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 18px',
            fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.45)',
            borderBottom: tab === t.key ? `2px solid ${accent}` : '2px solid transparent',
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {msg && <div style={{ padding: '10px 16px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, marginBottom: 20, fontSize: 14, color: accent }}>{msg}</div>}

      {tab === 'overview' && stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14, marginBottom: 40 }}>
            <Stat label="Total Users" value={stats.totalUsers.toLocaleString()} />
            <Stat label="Total Jobs" value={stats.totalJobs.toLocaleString()} />
            <Stat label="Credits Sold" value={stats.totalCreditsRevenue.toLocaleString()} />
            <Stat label="New Users 7d" value={stats.newUsersThisWeek.toLocaleString()} />
            <Stat label="Jobs 7d" value={stats.jobsThisWeek.toLocaleString()} />
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Recent Signups</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Email', 'Name', 'Role', 'Paid Credits', 'Free Used', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {stats.recentUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '11px 12px', color: '#fff' }}>{u.email}</td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.displayName ?? '—'}</td>
                    <td style={{ padding: '11px 12px' }}><RoleBadge role={PLATFORM_ADMINS.includes(u.email) ? 'super_admin' : u.platformRole} /></td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.paidCredits ?? 0}</td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.freeCreditsUsed ?? 0}</td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'blog' && (
        editPost ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>{editPost.id ? 'Edit Post' : 'New Post'}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setMdPreview(p => !p)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontSize: 13 }}>{mdPreview ? 'Edit' : 'Preview'}</button>
                <button onClick={() => { setEditPost(null); setMsg(''); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button onClick={savePost} disabled={saving} style={{ background: accent, border: 'none', borderRadius: 8, padding: '7px 20px', color: '#000', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
            {!mdPreview ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {([['Title', 'title', 'text'], ['Slug', 'slug', 'text'], ['Author', 'author', 'text'], ['Reading Time (min)', 'readingTime', 'number']] as [string, string, string][]).map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>{label}</label>
                    <input type={type} value={(editPost as any)[key] ?? ''} onChange={e => setEditPost(p => ({ ...p!, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Excerpt</label>
                  <textarea rows={2} value={editPost.excerpt ?? ''} onChange={e => setEditPost(p => ({ ...p!, excerpt: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Tags (comma-separated)</label>
                  <input type="text" value={editPost.tags?.join(', ') ?? ''} onChange={e => setEditPost(p => ({ ...p!, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Content (Markdown)</label>
                  <textarea rows={22} value={editPost.content ?? ''} onChange={e => setEditPost(p => ({ ...p!, content: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="pub" checked={editPost.published ?? false} onChange={e => setEditPost(p => ({ ...p!, published: e.target.checked }))}
                    style={{ accentColor: accent, width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="pub" style={{ fontSize: 14, cursor: 'pointer', color: '#fff' }}>Published (live)</label>
                </div>
              </div>
            ) : (
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(22px,5vw,30px)', marginBottom: 24 }}>{editPost.title}</h1>
                <div className="hai-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{editPost.content ?? ''}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>Blog Posts</h2>
              <button onClick={() => setEditPost({ ...BLANK })} style={{ background: accent, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ New Post</button>
            </div>
            {posts.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No posts in DB yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {posts.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(245,166,35,0.03)', border: '1px solid rgba(245,166,35,0.1)', borderRadius: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>/{p.slug} · {new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: p.published ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.06)', color: p.published ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                    <button onClick={() => setEditPost(p)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '5px 12px', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                    {myRole !== 'editor' && (
                      <button onClick={() => deletePost(p.id)} style={{ background: 'rgba(248,113,113,0.08)', border: 'none', borderRadius: 6, padding: '5px 12px', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}

      {tab === 'users' && isSuperAdmin && (
        <>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Users & Roles</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Email', 'Name', 'Platform Role', 'Paid Credits', 'Free Used', 'Joined', 'Assign Role'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '11px 12px', color: '#fff' }}>{u.email}</td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.displayName ?? '—'}</td>
                    <td style={{ padding: '11px 12px' }}><RoleBadge role={PLATFORM_ADMINS.includes(u.email) ? 'super_admin' : u.platformRole} /></td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.paidCredits ?? 0}</td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.freeCreditsUsed ?? 0}</td>
                    <td style={{ padding: '11px 12px', color: 'rgba(255,255,255,0.5)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td style={{ padding: '11px 12px' }}>
                      {!PLATFORM_ADMINS.includes(u.email) && (
                        <select value={u.platformRole ?? ''} onChange={e => setUserRole(u.id, (e.target.value as PlatformRole) || null)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                          <option value="">No role</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
