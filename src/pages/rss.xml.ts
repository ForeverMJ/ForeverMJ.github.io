import type { APIRoute } from 'astro';
import { news, profile } from '../data/site';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

export const GET: APIRoute = ({ site }) => {
  const home = new URL('/en/', site).href;
  const items = news
    .map((n) => {
      const link = n.url ?? `${home}#news`;
      return `    <item>
      <title>${esc(n.text.en)}</title>
      <description>${esc(n.text.ja)}</description>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(n.date + ':' + n.text.en)}</guid>
      <pubDate>${new Date((n.date.length === 7 ? n.date + '-01' : n.date) + 'T00:00:00+09:00').toUTCString()}</pubDate>
    </item>`;
    })
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
