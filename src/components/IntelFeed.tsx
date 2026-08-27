'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronDown, ChevronUp, ExternalLink, MapPin, Zap } from 'lucide-react';
import { formatAge, freshnessLabel, type FreshnessState } from '@/lib/freshness';

/* ═══════════════════════════════════════════════════════════════
   OCULIX — Intelligence Feed
   SIGINT-style news aggregation with risk scoring
   ═══════════════════════════════════════════════════════════════ */

interface IntelFeedProps {
  data: any;
  language?: 'ar' | 'en';
  onLocate?: (lat: number, lng: number) => void;
}

const copy = { ar: { feed: 'موجز المعلومات', alerts: 'تنبيهات', awaiting: 'بانتظار المعلومات…', now: 'الآن', minute: 'دقيقة', hour: 'ساعة', day: 'يوم', critical: 'حرج', high: 'مرتفع', elevated: 'متقدم', low: 'منخفض' }, en: { feed: 'SIGINT FEED', alerts: 'ALERTS', awaiting: 'AWAITING INTELLIGENCE…', now: 'now', minute: 'm ago', hour: 'h ago', day: 'd ago', critical: 'CRITICAL', high: 'HIGH', elevated: 'ELEVATED', low: 'LOW' } } as const;

function getRiskClass(score: number): string {
  if (score >= 8) return 'risk-critical';
  if (score >= 6) return 'risk-high';
  if (score >= 4) return 'risk-medium';
  return 'risk-low';
}

function getRiskLabel(score: number, language: 'ar' | 'en'): string {
  const t = copy[language];
  if (score >= 8) return t.critical;
  if (score >= 6) return t.high;
  if (score >= 4) return t.elevated;
  return t.low;
}

function timeAgo(dateStr: string, language: 'ar' | 'en'): string {
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (!Number.isFinite(diff) || diff < 60_000) return copy[language].now;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return language === 'ar' ? `منذ ${mins} ${copy.ar.minute}` : `${mins}${copy.en.minute}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return language === 'ar' ? `منذ ${hrs} ${copy.ar.hour}` : `${hrs}${copy.en.hour}`;
    const days = Math.floor(hrs / 24);
    return language === 'ar' ? `منذ ${days} ${copy.ar.day}` : `${days}${copy.en.day}`;
  } catch {
    return '';
  }
}

export default function IntelFeed({ data, language = 'en', onLocate }: IntelFeedProps) {
  const t = copy[language];
  const [expanded, setExpanded] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const news = data.news || [];
  const metadata = data.newsMeta;
  const freshness: FreshnessState = metadata?.freshness === 'LIVE' || metadata?.freshness === 'DELAYED' || metadata?.freshness === 'STALE' || metadata?.freshness === 'UNKNOWN' ? metadata.freshness : 'UNKNOWN';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="glass-panel flex flex-col overflow-hidden pointer-events-auto"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-3 hover:bg-[var(--hover-accent)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
          <span className="hud-text text-[11px] text-[var(--text-primary)]">{t.feed}</span>
          <span className="gotham-tag gotham-tag--info" style={{ fontSize: '9px', padding: '1px 5px' }}>{news.length}</span>
          <span className={`source-health-freshness source-health-freshness--${freshness.toLowerCase()}`}>{freshnessLabel(freshness, language)}</span>
          {news.some((n: any) => n.risk_score >= 8) && (
            <span className="gotham-tag gotham-tag--critical" style={{ fontSize: '9px', padding: '1px 4px' }}>{t.alerts}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--alert-green)] animate-oculix-pulse" />
          {expanded ? <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
        </div>
      </button>

      {/* News Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[400px] overflow-y-auto styled-scrollbar divide-y divide-[var(--border-secondary)]">
              {news.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest">
                    {t.awaiting}
                  </span>
                </div>
              ) : (
                news.slice(0, 25).map((item: any, i: number) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    className="px-4 py-2.5 hover:bg-[var(--hover-accent)] transition-colors cursor-pointer"
                    onClick={() => { if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer'); else setSelectedIdx(selectedIdx === i ? null : i); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && item.link) window.open(item.link, '_blank', 'noopener,noreferrer'); }}
                  >
                    {/* Top row: risk badge + source + time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold tracking-widest ${getRiskClass(item.risk_score)}`}>
                        {getRiskLabel(item.risk_score, language)}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                        {item.source}
                      </span>
                      {item.coords && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLocate?.(item.coords[0], item.coords[1]);
                          }}
                          className="text-[var(--text-muted)] hover:text-[var(--cyan-primary)] transition-colors"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <span className="text-[9px] font-mono text-[var(--text-muted)] ml-auto">
                        {timeAgo(item.published, language)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-[10px] text-[var(--text-primary)] leading-tight line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="oculix-provenance-row" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <span>{language === 'ar' ? 'المصدر' : 'SOURCE'}: {item.source || (language === 'ar' ? 'غير معروف' : 'Unknown')}</span>
                      <span>{language === 'ar' ? 'الثقة' : 'CONFIDENCE'}: {typeof item.confidence === 'number' ? `${Math.round(item.confidence * (item.confidence <= 1 ? 100 : 1))}%` : typeof metadata?.confidence === 'number' ? `${Math.round(metadata.confidence * 100)}%` : (language === 'ar' ? 'غير محددة' : 'UNSCORED')}</span>
                      <span>{metadata?.source || (language === 'ar' ? 'مصدر الخبر' : 'NEWS SOURCE')} · {formatAge(typeof metadata?.ageSeconds === 'number' ? metadata.ageSeconds : null, language)}</span>
                      <span>{timeAgo(item.published, language)}</span>
                    </div>

                    {/* Machine Assessment (if critical) */}
                    {item.machine_assessment && (
                      <div className="mt-1.5 flex items-start gap-1.5 bg-red-950/20 border border-red-900/20 rounded px-2 py-1">
                        <Zap className="w-2.5 h-2.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] font-mono text-red-400/80 leading-relaxed">
                          {item.machine_assessment}
                        </span>
                      </div>
                    )}

                    {/* Expanded details */}
                    <AnimatePresence>
                      {selectedIdx === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 overflow-hidden"
                        >
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-mono text-[var(--cyan-primary)] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            OPEN SOURCE
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
