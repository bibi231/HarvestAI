import { Router, Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { db } from '../db/index.js';
import { users, harvestJobs, payments, blogPosts } from '../db/schema.js';
import { count, sum, gte, eq, desc } from 'drizzle-orm';

export type PlatformRole = 'super_admin' | 'admin' | 'editor';

const PLATFORM_ADMINS = ['peterjohn2343@gmail.com', 'bitrus@trueweb.ng'];
const router = Router();

async function resolveRole(email: string, uid: string): Promise<PlatformRole | null> {
  if (PLATFORM_ADMINS.includes(email)) return 'super_admin';
  const [row] = await db.select({ platformRole: users.platformRole }).from(users).where(eq(users.id, uid));
  return (row?.platformRole as PlatformRole) ?? null;
}

function requireAuth(minRole: PlatformRole) {
  const hierarchy: Record<PlatformRole, number> = { editor: 1, admin: 2, super_admin: 3 };
  return function (req: Request, res: Response, next: NextFunction): void {
    verifyFirebaseToken(req, res, async () => {
      if (!req.user?.email) { res.status(403).json({ error: 'FORBIDDEN' }); return; }
      const role = await resolveRole(req.user.email, req.user.uid);
      if (!role || hierarchy[role] < hierarchy[minRole]) {
        res.status(403).json({ error: 'FORBIDDEN', required: minRole, got: role });
        return;
      }
      (req as any).platformRole = role;
      next();
    });
  };
}

// --- Stats (admin+) ---
router.get('/stats', requireAuth('admin'), async (_req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsersRow] = await db.select({ c: count() }).from(users);
    const [totalJobsRow] = await db.select({ c: count() }).from(harvestJobs);
    const [newUsersRow] = await db.select({ c: count() }).from(users).where(gte(users.createdAt, weekAgo));
    const [revenueRow] = await db.select({ total: sum(payments.credits) }).from(payments).where(eq(payments.status, 'success'));
    const [jobsWeekRow] = await db.select({ c: count() }).from(harvestJobs).where(gte(harvestJobs.createdAt, weekAgo));
    const recentUsers = await db.select({
      id: users.id, email: users.email, displayName: users.displayName,
      paidCredits: users.paidCredits, freeCreditsUsed: users.freeCreditsUsed,
      platformRole: users.platformRole, createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(10);
    res.json({ success: true, data: {
      totalUsers: totalUsersRow?.c ?? 0, totalJobs: totalJobsRow?.c ?? 0,
      totalCreditsRevenue: Number(revenueRow?.total ?? 0),
      newUsersThisWeek: newUsersRow?.c ?? 0, jobsThisWeek: jobsWeekRow?.c ?? 0,
      recentUsers,
    }});
  } catch (err) { next(err); }
});

// --- Users list (admin+) ---
router.get('/users', requireAuth('admin'), async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const [total] = await db.select({ c: count() }).from(users);
    const rows = await db.select({
      id: users.id, email: users.email, displayName: users.displayName,
      platformRole: users.platformRole, paidCredits: users.paidCredits,
      freeCreditsUsed: users.freeCreditsUsed, createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    res.json({ success: true, data: rows, total: total?.c ?? 0, page, pages: Math.ceil((total?.c ?? 0) / limit) });
  } catch (err) { next(err); }
});

// --- Assign role (super_admin only) ---
router.patch('/users/:id/role', requireAuth('super_admin'), async (req, res, next) => {
  try {
    const { role } = req.body as { role: PlatformRole | null };
    const allowed: (PlatformRole | null)[] = ['admin', 'editor', null];
    if (!allowed.includes(role)) { res.status(400).json({ error: 'INVALID_ROLE' }); return; }
    await db.update(users).set({ platformRole: role ?? undefined }).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// --- Blog list (editor+) ---
router.get('/blog', requireAuth('editor'), async (_req, res, next) => {
  try {
    const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// --- Create post (editor+) ---
router.post('/blog', requireAuth('editor'), async (req, res, next) => {
  try {
    const { slug, title, excerpt, content, author, tags, readingTime, published } = req.body;
    if (!slug || !title || !content) { res.status(400).json({ error: 'MISSING_FIELDS' }); return; }
    const [post] = await db.insert(blogPosts).values({ slug, title, excerpt, content, author, tags, readingTime, published }).returning();
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
});

// --- Update post (editor+) ---
router.put('/blog/:id', requireAuth('editor'), async (req, res, next) => {
  try {
    const { slug, title, excerpt, content, author, tags, readingTime, published } = req.body;
    const [post] = await db.update(blogPosts).set({
      slug, title, excerpt, content, author, tags, readingTime, published, updatedAt: new Date(),
    }).where(eq(blogPosts.id, req.params.id)).returning();
    if (!post) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

// --- Delete post (admin+) ---
router.delete('/blog/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// --- Public blog (no auth) ---
router.get('/public/blog', async (_req, res, next) => {
  try {
    const rows = await db.select({
      id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title,
      excerpt: blogPosts.excerpt, author: blogPosts.author, tags: blogPosts.tags,
      readingTime: blogPosts.readingTime, createdAt: blogPosts.createdAt,
    }).from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/public/blog/:slug', async (req, res, next) => {
  try {
    const [post] = await db.select().from(blogPosts)
      .where(eq(blogPosts.slug, req.params.slug));
    if (!post || !post.published) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

export default router;
