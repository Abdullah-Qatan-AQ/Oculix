'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, RefreshCw, ShieldCheck, TriangleAlert, X } from 'lucide-react';
import type { SourceHealth, SourceStatus } from '@/lib/sourceHealth';

type Language = 'ar' | 'en';

interface SourceHealthPanelProps {
  open: boolean;
  onClose: () => void;
  language: Language;
}

const copy = {
  ar: {
    title: 'مركز صحة المصادر', subtitle: 'مراقبة حداثة البيانات وموثوقية الاتصالات', refresh: 'تحديث', close: 'إغلاق', empty: 'لم تُسجّل مصادر بعد. افتح طبقة أو مصدراً حياً لتظهر قياساته هنا.', source: 'المصدر', status: 'الحالة', latency: 'الزمن', updated: 'آخر تحديث', errors: 'الأخطاء', reliability: 'الموثوقية', live: 'مباشر', stale: 'متقادم', degraded: 'متدهور', offline: 'متوقف', unknown: 'غير معروف', ago: 'منذ', seconds: 'ث', minutes: 'د', hours: 'س', cache: 'إصابات الكاش', items: 'العناصر', note: 'الفشل في مصدر واحد لا يوقف بقية المنصة؛ تُعرض آخر بيانات صالحة عند توفرها.', unavailable: 'غير متاح',
  },
  en: {
    title: 'Source Health Center', subtitle: 'Freshness and reliability monitoring', refresh: 'Refresh', close: 'Close', empty: 'No sources recorded yet. Open a live layer or source to populate this center.', source: 'Source', status: 'Status', latency: 'Latency', updated: 'Last update', errors: 'Errors', reliability: 'Reliability', live: 'Live', stale: 'Stale', degraded: 'Degraded', offline: 'Offline', unknown: 'Unknown', ago: 'ago', seconds: 's', minutes: 'm', hours: 'h', cache: 'Cache hits', items: 'Items', note: 'One source failure does not stop the platform; the last good data is served when available.', unavailable: 'Unavailable',
  },
} as const;

function ageLabel(ageSeconds: number | null, language: Language): string {
  if (ageSeconds === null) return copy[language].unavailable;
  const t = copy[language];
  if (ageSeconds < 60) return `${language === 'ar' ? t.ago + ' ' : ''}${ageSeconds}${t.seconds}${language === 'en' ? ` ${t.ago}` : ''}`;
  const minutes = Math.floor(ageSeconds / 60);
  if (minutes < 60) return `${language === 'ar' ? t.ago + ' ' : ''}${minutes}${t.minutes}${language === 'en' ? ` ${t.ago}` : ''}`;
  const hours = Math.floor(minutes / 60);
  return `${language === 'ar' ? t.ago + ' ' : ''}${hours}${t.hours}${language === 'en' ? ` ${t.ago}` : ''}`;
}

function statusText(status: SourceStatus, language: Language): string {
  const t = copy[language];
  return t[status];
}

function statusClass(status: SourceStatus): string {
  return `source-health-status source-health-status--${status}`;
}

export default function SourceHealthPanel({ open, onClose, language }: SourceHealthPanelProps) {
  const t = copy[language];
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/sources', { cache: 'no-store' });
      if (!response.ok) throw new Error('health request failed');
      const payload = await response.json() as { sources?: SourceHealth[] };
      setSources(Array.isArray(payload.sources) ? payload.sources : []);
      setLastFetch(Date.now());
    } catch {
      // The center itself is non-critical; preserve the last good view.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 30_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [load, open]);

  const summary = useMemo(() => sources.reduce((acc, source) => {
    acc[source.status] += 1;
    return acc;
  }, { live: 0, stale: 0, degraded: 0, offline: 0, unknown: 0 } as Record<SourceStatus, number>), [sources]);

  if (!open) return null;

  return (
    <aside className="oculix-source-health-panel" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={t.title}>
      <header className="oculix-source-health-header">
        <div><div className="oculix-kicker"><Activity size={13} /> SOURCE HEALTH</div><h2>{t.title}</h2><p>{t.subtitle}</p></div>
        <div className="oculix-source-health-actions"><button type="button" onClick={() => void load()} disabled={loading} title={t.refresh} aria-label={t.refresh}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={onClose} title={t.close} aria-label={t.close}><X size={16} /></button></div>
      </header>
      <div className="oculix-source-health-summary"><span className="source-health-chip source-health-chip--live">{summary.live} {t.live}</span><span className="source-health-chip source-health-chip--degraded">{summary.degraded} {t.degraded}</span><span className="source-health-chip source-health-chip--stale">{summary.stale} {t.stale}</span><span className="source-health-chip source-health-chip--offline">{summary.offline} {t.offline}</span></div>
      {sources.length === 0 ? <div className="oculix-source-health-empty"><ShieldCheck size={22} /><p>{t.empty}</p></div> : <div className="oculix-source-health-list"><div className="oculix-source-health-grid oculix-source-health-grid--head"><span>{t.source}</span><span>{t.status}</span><span>{t.latency}</span><span>{t.updated}</span><span>{t.errors}</span><span>{t.reliability}</span></div>{sources.map(source => <div key={source.source} className="oculix-source-health-grid"><strong title={source.source}>{source.source}</strong><span className={statusClass(source.status)}>{statusText(source.status, language)}</span><span>{source.latencyMs === null ? '—' : `${source.latencyMs}ms`}</span><span><Clock3 size={12} />{ageLabel(source.ageSeconds, language)}</span><span className={source.errors ? 'text-amber-300' : 'text-emerald-300'}>{source.errors}</span><span>{Math.round(source.reliability * 100)}%</span><small>{t.items}: {source.items ?? '—'} · {t.cache}: {source.cacheHits}</small></div>)}</div>}
      <footer className="oculix-source-health-footer"><TriangleAlert size={13} />{t.note}{lastFetch ? <time dateTime={new Date(lastFetch).toISOString()}>{new Date(lastFetch).toLocaleTimeString(language === 'ar' ? 'ar' : 'en')}</time> : null}</footer>
    </aside>
  );
}
