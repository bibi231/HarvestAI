import { Router } from 'express';
import { db } from '../db/index.js';
import { blogPosts } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select({
      id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title,
      excerpt: blogPosts.excerpt, author: blogPosts.author, tags: blogPosts.tags,
      readingTime: blogPosts.readingTime, createdAt: blogPosts.createdAt,
    }).from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const [post] = await db.select().from(blogPosts)
      .where(eq(blogPosts.slug, req.params.slug));
    if (!post || !post.published) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

export default router;
