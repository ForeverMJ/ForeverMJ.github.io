import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LANGS } from './data/site';

// One Markdown file per post and language: src/content/posts/<lang>/<slug>.md
// Translations of a post share the file name, which becomes the URL slug.
// (Don't put `slug` in the frontmatter: the glob loader would use it as the entry id,
// and translations would overwrite each other.)
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(LANGS),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
