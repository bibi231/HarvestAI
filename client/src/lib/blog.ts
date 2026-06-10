export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  content: string;
  readingTime: number;
}

function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split('\n')) {
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    const value = line.slice(ci + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  return { data, content: match[2] };
}

function wordsPerMinute(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

const rawFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function getAllPosts(): BlogPost[] {
  return Object.entries(rawFiles)
    .map(([path, raw]) => {
      const slug = path.replace('../content/blog/', '').replace('.md', '');
      const { data, content } = parseFrontmatter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        excerpt: (data.excerpt as string) || '',
        date: (data.date as string) || '',
        author: (data.author as string) || 'HarvestAI Team',
        tags: (data.tags as string[]) || [],
        content,
        readingTime: wordsPerMinute(content),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug);
}
