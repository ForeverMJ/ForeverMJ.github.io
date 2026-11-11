import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../data/site';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first; only those in `lang` when given. */
export async function getPosts(lang?: Lang): Promise<Post[]> {
  const all = await getCollection('posts', (p) => !p.data.draft && (!lang || p.data.lang === lang));
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The file name without the language folder: `ja/foo` → `foo`. Shared by a post's translations. */
export const postSlug = (p: Post) => p.id.replace(/^[^/]+\//, '');

export const postUrl = (p: Post) => `/${p.data.lang}/posts/${postSlug(p)}/`;

/** URL of every language version of the post with this slug. */
export async function translations(slug: string): Promise<Partial<Record<Lang, string>>> {
  const versions = (await getPosts()).filter((p) => postSlug(p) === slug);
  return Object.fromEntries(versions.map((p) => [p.data.lang, postUrl(p)]));
}

export const fmtDay = (d: Date) => d.toISOString().slice(0, 10).replaceAll('-', '.');
