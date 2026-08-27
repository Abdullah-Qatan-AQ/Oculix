import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cachedSource } from '@/lib/sourceCache';
import { getSourceHealth } from '@/lib/sourceHealth';

/** OCULIX — aggregated public intelligence feed with explicit provenance. */
const TELEGRAM_CHANNELS = ['OSINTtechnical', 'Faytuks', 'Liveuamap', 'CyberKnow'];
const FALLBACK_FEEDS = {
  BBC: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  AlJazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
  GDACS: 'https://www.gdacs.org/xml/rss.xml',
};
const RISK_KEYWORDS = ['war', 'missile', 'strike', 'attack', 'crisis', 'tension', 'military', 'conflict', 'defense', 'clash', 'nuclear', 'invasion', 'bomb', 'drone', 'weapon', 'sanctions', 'ceasefire', 'escalation', 'killed', 'destroyed', 'operation', 'casualty', 'frontline', 'threat'];
const KEYWORD_COORDS: Record<string, [number, number]> = {
  ukraine: [49.487, 31.272], kyiv: [50.45, 30.523], russia: [61.524, 105.318], moscow: [55.755, 37.617],
  israel: [31.046, 34.851], gaza: [31.416, 34.333], iran: [32.427, 53.688], lebanon: [33.854, 35.862],
  syria: [34.802, 38.996], yemen: [15.552, 48.516], china: [35.861, 104.195], taiwan: [23.697, 120.96],
  'united states': [38.907, -77.036], europe: [48.8, 2.3], 'middle east': [31.5, 34.8],
};

type RawArticle = { title: string; description: string; link: string; pubDate: string; source: string };
export type NewsItem = RawArticle & { id: string; published: string; risk_score: number; coords: [number, number] | null; coords_default: boolean; machine_assessment: string | null };

function scoreRisk(text: string): number {
  const lower = text.toLowerCase();
  return Math.min(10, 1 + RISK_KEYWORDS.reduce((score, keyword) => score + (lower.includes(keyword) ? 2 : 0), 0));
}

function findCoords(text: string): [number, number] | null {
  const lower = text.toLowerCase();
  for (const [keyword, coords] of Object.entries(KEYWORD_COORDS)) if (lower.includes(keyword)) return coords;
  return null;
}

function parseTelegramHTML(html: string, channel: string): RawArticle[] {
  const items: RawArticle[] = [];
  const messageBlockRegex = /<div class="tgme_widget_message_wrap js-widget_message_wrap"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = messageBlockRegex.exec(html)) !== null) {
    const blockHtml = blockMatch[0];
    const textMatch = blockHtml.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/i);
    if (!textMatch) continue;
    const text = textMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
    if (!text || text.length < 10) continue;
    const dateMatch = blockHtml.match(/<a class="tgme_widget_message_date" href="(https:\/\/t\.me\/[^\"]+)".*?<time datetime="([^\"]+)"/i);
    items.push({ title: text.split('\n')[0].substring(0, 100), description: text, link: dateMatch?.[1] ?? `https://t.me/${channel}`, pubDate: dateMatch?.[2] ?? new Date().toISOString(), source: `t.me/${channel}` });
  }
  return items;
}

function parseRSSItems(xml: string, sourceName: string): RawArticle[] {
  const items: RawArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag: string) => {
      const found = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return (found?.[1] ?? found?.[2] ?? '').trim();
    };
    const title = getTag('title').replace(/<[^>]+>/g, '');
    items.push({ title: title.length > 100 ? `${title.substring(0, 100)}...` : title, description: getTag('description').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"'), link: getTag('link'), pubDate: getTag('pubDate') || new Date().toISOString(), source: sourceName });
  }
  return items;
}

async function fetchNewsItems(): Promise<NewsItem[]> {
  const feedPromises = TELEGRAM_CHANNELS.map(async channel => {
    try {
      const response = await fetch(`https://t.me/s/${channel}`, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0 Oculix/1.0', Accept: 'text/html' } });
      if (!response.ok) return [] as RawArticle[];
      return parseTelegramHTML(await response.text(), channel).slice(-8);
    } catch { return [] as RawArticle[]; }
  });
  const allArticles: RawArticle[] = [];
  for (const result of await Promise.allSettled(feedPromises)) if (result.status === 'fulfilled') allArticles.push(...result.value);

  let sourceMode: 'telegram' | 'rss-fallback' = 'telegram';
  if (allArticles.length === 0) {
    sourceMode = 'rss-fallback';
    const fallbackPromises = Object.entries(FALLBACK_FEEDS).map(async ([source, url]) => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/rss+xml, application/xml' } });
        if (!response.ok) return [] as RawArticle[];
        return parseRSSItems(await response.text(), source).slice(0, 5);
      } catch { return [] as RawArticle[]; }
    });
    for (const result of await Promise.allSettled(fallbackPromises)) if (result.status === 'fulfilled') allArticles.push(...result.value);
  }

  const newsItems = allArticles.map(article => {
    const text = article.description || article.title;
    const riskScore = scoreRisk(text);
    const coords = findCoords(text);
    return {
      ...article,
      id: crypto.createHash('sha256').update(`${article.link}|${article.pubDate}`).digest('hex').slice(0, 32),
      published: article.pubDate,
      risk_score: riskScore,
      coords,
      coords_default: !coords,
      machine_assessment: riskScore >= 8 ? 'Heuristic assessment: elevated priority based on keywords; not a causal or verified conclusion.' : null,
      source_mode: sourceMode,
    } as NewsItem & { source_mode: typeof sourceMode };
  });
  newsItems.sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  return newsItems;
}

const getNewsItems = cachedSource<NewsItem>('news', fetchNewsItems, 60_000);

export async function GET() {
  try {
    const news = await getNewsItems();
    const health = getSourceHealth('news');
    return NextResponse.json({
      news,
      total: news.length,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'news',
        fetchedAt: health.lastUpdated,
        ageSeconds: health.ageSeconds,
        freshness: health.freshness,
        confidence: health.confidence,
        status: health.status,
        cacheHits: health.cacheHits,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ news: [], total: 0, metadata: { source: 'news', freshness: 'STALE', confidence: null, status: 'offline' }, error: 'Failed to fetch intel' }, { status: 503 });
  }
}
