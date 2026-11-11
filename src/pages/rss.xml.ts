import type { APIRoute } from 'astro';
import { news, newsUrl, profile } from '../data/site';
import { getPosts, postUrl } from '../lib/posts';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

const item = (title: string, description: string, link: string, guid: string, date: Date) => `    <item>
      <title>${esc(title)}</title>
      <description>${esc(description)}</description>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(guid)}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
    </item>`;

export const GET: APIRoute = async ({ site }) => {
  const home = new URL('/en/', site).href;
  const newsItems = news.map((n) => {
    const date = new Date((n.date.length === 7 ? n.date + '-01' : n.date) + 'T00:00:00+09:00');
    const link = new URL(newsUrl(n, 'en') ?? '/en/#news', site).href;
    return { date, xml: item(n.text.en, n.text.ja, link, n.date + ':' + n.text.en, date) };
  });
  const postItems = (await getPosts()).map((p) => ({
    date: p.data.date,
    xml: item(p.data.title, p.data.description, new URL(postUrl(p), site).href, postUrl(p), p.data.date),
  }));
  const items = [...postItems, ...newsItems]
    .sort((a, b) => b.date.valueOf() - a.date.valueOf())
    .map((i) => i.xml)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(profile.name.en)}</title>
    <link>${home}</link>
    <description>${esc(profile.tagline.en)}</description>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
