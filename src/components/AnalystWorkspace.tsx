'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, BookmarkPlus, Check, Clock3, FileText, GitBranch, Link2, LockKeyhole, Network, Save, ShieldAlert, Sparkles, X } from 'lucide-react';

type Language = 'ar' | 'en';
type Mode = 'live' | 'analyst';
export type AnalystEvent = { id: string; kind: 'flight' | 'weather' | 'news' | 'quake' | 'fire' | 'other'; title: string; source: string; timestamp: string; lat?: number; lng?: number; confidence?: number | null };
type MapContext = { latitude: number; longitude: number; zoom: number };
type Metrics = { flights: number; earthquakes: number; fires: number; satellites: number; news: number };

interface Investigation {
  id: string;
  title: string;
  target: string;
  area: string;
  timeRange: string;
  notes: string;
  createdAt: string;
  snapshot: Metrics;
  timeline: AnalystEvent[];
  mapContext: MapContext | null;
  confidence: number | null;
}

interface AnalystWorkspaceProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  metrics: Metrics;
  events?: AnalystEvent[];
  mapContext?: MapContext | null;
  onLocate?: (lat: number, lng: number) => void;
}

const STORAGE_KEY = 'oculix-investigations-v2';
const LEGACY_STORAGE_KEY = 'oculix-investigations-v1';

const copy = {
  ar: {
    title: 'مساحة المحلل', kicker: 'وضع المحلل', subtitle: 'أوقف اللحظة، وثّق الأدلة، واحتفظ بسياق التحقيق', live: 'مباشر', analyst: 'محلل', close: 'إغلاق', pin: 'تثبيت اللقطة الحالية', pinned: 'لقطة مثبتة', newInvestigation: 'تحقيق جديد', saved: 'التحقيقات المحفوظة', titleLabel: 'اسم التحقيق', target: 'الهدف', area: 'المنطقة', range: 'النطاق الزمني', notes: 'ملاحظات المحلل', save: 'حفظ التحقيق', share: 'مشاركة التحقيق', copied: 'تم نسخ رابط التحقيق', report: 'توليد تقرير Markdown', analyze: 'حلّل اللقطة', analyzing: 'جارٍ التحليل…', noSaved: 'لا توجد تحقيقات محفوظة بعد.', timeline: 'الخط الزمني', timelineHint: 'الأحداث الملتقطة من المصادر الحالية؛ انقر على حدث موضّع للعودة إلى الخريطة.', correlation: 'محرك الارتباط', graph: 'رسم الكيانات', graphHint: 'علاقات استكشافية مبنية على اللقطة الحالية؛ راجع المصدر قبل الاستنتاج.', correlationHint: 'هذه إشارة استكشافية وليست إثباتاً سببياً؛ راجع الأدلة والمصادر قبل الاستنتاج.', possible: 'ارتباط محتمل يحتاج مراجعة', evidence: 'سلسلة الأدلة', evidenceHint: 'كل نتيجة يجب أن تُربط بالمصدر والنتيجة والوقت.', source: 'المصدر', result: 'النتيجة', timestamp: 'الوقت', current: 'الحالي', entities: 'الكيانات', snapshot: 'لقطة', flight: 'رحلات', quake: 'زلازل', fire: 'حرائق', satellite: 'أقمار', news: 'أخبار', empty: 'فارغ', review: 'يتطلب مراجعة محلل', map: 'سياق الخريطة', noEvents: 'لا توجد أحداث زمنية في اللقطة.', confidence: 'الثقة', imported: 'تحقيق مستورد من الرابط', noLocation: 'بلا إحداثيات', kind: { flight: 'طيران', weather: 'طقس', news: 'خبر', quake: 'زلزال', fire: 'حريق', other: 'حدث' }, ranges: { hour: 'آخر ساعة', day: 'آخر 24 ساعة', week: 'آخر 7 أيام', custom: 'نطاق مخصص' },
  },
  en: {
    title: 'Analyst Workspace', kicker: 'ANALYST MODE', subtitle: 'Pin the moment, document evidence and preserve investigation context', live: 'LIVE', analyst: 'ANALYST', close: 'Close', pin: 'Pin current snapshot', pinned: 'Snapshot pinned', newInvestigation: 'New investigation', saved: 'Saved investigations', titleLabel: 'Investigation title', target: 'Target', area: 'Area', range: 'Time range', notes: 'Analyst notes', save: 'Save investigation', share: 'Share investigation', copied: 'Investigation link copied', report: 'Generate Markdown report', analyze: 'Analyze snapshot', analyzing: 'Analyzing…', noSaved: 'No saved investigations yet.', timeline: 'Intelligence timeline', timelineHint: 'Events captured from current sources; select a located event to return to the map.', correlation: 'Correlation engine', graph: 'Entity graph', graphHint: 'Exploratory relationships from the current snapshot; verify sources before concluding.', correlationHint: 'This is an exploratory signal, not causal proof; review evidence and sources before concluding.', possible: 'Possible correlation — review required', evidence: 'Evidence chain', evidenceHint: 'Every result should link back to source, result and time.', source: 'Source', result: 'Result', timestamp: 'Timestamp', current: 'Current', entities: 'Entities', snapshot: 'Snapshot', flight: 'Flights', quake: 'Quakes', fire: 'Fires', satellite: 'Satellites', news: 'News', empty: 'Empty', review: 'Requires analyst review', map: 'Map context', noEvents: 'No timeline events in this snapshot.', confidence: 'Confidence', imported: 'Investigation imported from link', noLocation: 'No coordinates', kind: { flight: 'Flight', weather: 'Weather', news: 'News', quake: 'Quake', fire: 'Fire', other: 'Event' }, ranges: { hour: 'Last hour', day: 'Last 24 hours', week: 'Last 7 days', custom: 'Custom range' },
  },
} as const;

function isFiniteMetrics(value: unknown): value is Metrics {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Metrics>;
  return ['flights', 'earthquakes', 'fires', 'satellites', 'news'].every(key => Number.isFinite(candidate[key as keyof Metrics]));
}

function isAnalystEvent(value: unknown): value is AnalystEvent {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AnalystEvent>;
  return typeof item.id === 'string' && typeof item.title === 'string' && typeof item.source === 'string' && typeof item.timestamp === 'string';
}

function isInvestigation(value: unknown): value is Investigation {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Investigation>;
  return typeof item.id === 'string' && typeof item.title === 'string' && typeof item.target === 'string' && typeof item.area === 'string' && typeof item.timeRange === 'string' && typeof item.notes === 'string' && typeof item.createdAt === 'string' && isFiniteMetrics(item.snapshot) && Array.isArray(item.timeline) && item.timeline.every(isAnalystEvent);
}

function readSaved(): Investigation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(value => {
      if (isInvestigation(value)) return value;
      if (!value || typeof value !== 'object') return null;
      const legacy = value as Partial<Investigation>;
      if (typeof legacy.id !== 'string' || typeof legacy.title !== 'string' || typeof legacy.target !== 'string' || typeof legacy.area !== 'string' || typeof legacy.timeRange !== 'string' || typeof legacy.notes !== 'string' || typeof legacy.createdAt !== 'string' || !isFiniteMetrics(legacy.snapshot)) return null;
      return { id: legacy.id, title: legacy.title, target: legacy.target, area: legacy.area, timeRange: legacy.timeRange, notes: legacy.notes, createdAt: legacy.createdAt, snapshot: legacy.snapshot, timeline: [], mapContext: null, confidence: null } satisfies Investigation;
    }).filter((value): value is Investigation => value !== null).slice(0, 25);
  } catch { return []; }
}

function writeSaved(items: Investigation[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 25))); } catch { /* Storage quota/private mode must not break analyst mode. */ }
}

function distanceKm(a: AnalystEvent, b: AnalystEvent): number | null {
  if (!Number.isFinite(a.lat) || !Number.isFinite(a.lng) || !Number.isFinite(b.lat) || !Number.isFinite(b.lng)) return null;
  const rad = Math.PI / 180;
  const dLat = ((b.lat! - a.lat!) * rad);
  const dLng = ((b.lng! - a.lng!) * rad);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat! * rad) * Math.cos(b.lat! * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function correlate(events: AnalystEvent[]): { found: boolean; evidence: AnalystEvent[] } {
  for (const anchor of events) {
    const anchorTime = Date.parse(anchor.timestamp);
    if (!Number.isFinite(anchorTime)) continue;
    for (const peer of events) {
      if (peer.id === anchor.id || peer.kind === anchor.kind) continue;
      const peerTime = Date.parse(peer.timestamp);
      const distance = distanceKm(anchor, peer);
      if (!Number.isFinite(peerTime) || distance === null || Math.abs(peerTime - anchorTime) > 6 * 60 * 60 * 1000 || distance > 500) continue;
      const kinds = new Set([anchor.kind, peer.kind]);
      if ((kinds.has('news') && (kinds.has('flight') || kinds.has('weather') || kinds.has('quake'))) || (kinds.has('flight') && kinds.has('weather'))) return { found: true, evidence: [anchor, peer] };
    }
  }
  return { found: false, evidence: [] };
}

export default function AnalystWorkspace({ open, onClose, language, metrics, events = [], mapContext = null, onLocate }: AnalystWorkspaceProps) {
  const t = copy[language];
  const [mode, setMode] = useState<Mode>('analyst');
  const [snapshot, setSnapshot] = useState<Metrics | null>(null);
  const [saved, setSaved] = useState<Investigation[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [area, setArea] = useState('');
  const [timeRange, setTimeRange] = useState('day');
  const [notes, setNotes] = useState('');
  const [aiOverview, setAiOverview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setSaved(readSaved());
      try {
        const encoded = new URLSearchParams(window.location.search).get('investigation');
        if (!encoded) return;
        const shared: unknown = JSON.parse(decodeURIComponent(encoded));
        if (!isInvestigation(shared)) return;
        setTitle(shared.title); setTarget(shared.target); setArea(shared.area); setTimeRange(shared.timeRange); setNotes(shared.notes); setSnapshot(shared.snapshot); setShareMessage(t.imported);
      } catch { /* Invalid shared payloads are ignored safely. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, t.imported]);

  const currentMetrics = mode === 'analyst' ? (snapshot || metrics) : metrics;
  const timeline = useMemo(() => [...events].filter(isAnalystEvent).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 40), [events]);
  const correlation = useMemo(() => correlate(timeline), [timeline]);
  const confidence = useMemo(() => {
    const values = timeline.map(event => event.confidence).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }, [timeline]);

  const pinSnapshot = () => { setMode('analyst'); setSnapshot({ ...metrics }); };
  const analyzeSnapshot = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'alerts', payload: { counts: currentMetrics } }) });
      const payload = await response.json() as { overview?: string };
      setAiOverview(payload.overview || t.empty);
    } catch { setAiOverview(t.empty); } finally { setAiLoading(false); }
  };
  const makeInvestigation = (): Investigation => ({ id: `INV-${Date.now().toString(36).toUpperCase()}`, title: title.trim() || `${t.newInvestigation} ${saved.length + 1}`, target: target.trim(), area: area.trim(), timeRange, notes: notes.trim(), createdAt: new Date().toISOString(), snapshot: { ...currentMetrics }, timeline: timeline.slice(0, 40), mapContext, confidence });
  const saveInvestigation = () => {
    const next = [makeInvestigation(), ...saved].slice(0, 25);
    setSaved(next); writeSaved(next); setTitle(''); setTarget(''); setArea(''); setNotes('');
  };
  const shareInvestigation = async (item: Investigation) => {
    const url = `${window.location.origin}${window.location.pathname}?investigation=${encodeURIComponent(JSON.stringify(item))}`;
    try { await navigator.clipboard.writeText(url); setShareMessage(t.copied); } catch { setShareMessage(url); }
  };
  const generateReport = () => {
    const report = [`# Oculix Intelligence Report`, ``, `## ${title.trim() || `${t.newInvestigation} ${saved.length + 1}`}`, ``, `- ${t.target}: ${target.trim() || t.empty}`, `- ${t.area}: ${area.trim() || t.empty}`, `- ${t.range}: ${timeRange}`, `- ${t.timestamp}: ${new Date().toISOString()}`, `- ${t.confidence}: ${confidence === null ? t.empty : `${Math.round(confidence * 100)}%`}`, mapContext ? `- ${t.map}: ${mapContext.latitude.toFixed(4)}, ${mapContext.longitude.toFixed(4)} / z${mapContext.zoom}` : `- ${t.map}: ${t.noLocation}`, ``, `## ${t.snapshot}`, ``, `- ${t.flight}: ${currentMetrics.flights}`, `- ${t.quake}: ${currentMetrics.earthquakes}`, `- ${t.fire}: ${currentMetrics.fires}`, `- ${t.satellite}: ${currentMetrics.satellites}`, `- ${t.news}: ${currentMetrics.news}`, ``, `## ${t.timeline}`, ``, ...(timeline.length ? timeline.map(event => `- ${event.timestamp} — ${event.kind} — ${event.title} — ${event.source}`) : [`${t.noEvents}`]), ``, `## ${t.notes}`, ``, notes.trim() || t.empty, ``, `## ${t.evidence}`, ``, ...(timeline.length ? timeline.slice(0, 12).map(event => `- ${event.source} → ${event.title} → ${event.timestamp}`) : [`${t.source} → ${t.result} → ${t.timestamp}`]), ``, `> ${t.correlationHint}`].join('\n');
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${(title.trim() || 'oculix-report').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`; link.click(); URL.revokeObjectURL(url);
  };

  if (!open) return null;
  return (
    <aside className="oculix-analyst-workspace" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={t.title}>
      <header className="oculix-analyst-header"><div><div className="oculix-kicker"><Sparkles size={13} /> {t.kicker}</div><h2>{t.title}</h2><p>{t.subtitle}</p></div><button type="button" onClick={onClose} aria-label={t.close} title={t.close}><X size={16} /></button></header>
      <div className="oculix-analyst-modebar"><button type="button" className={mode === 'live' ? 'is-selected' : ''} onClick={() => setMode('live')}><span className="oculix-mode-dot" />{t.live}</button><button type="button" className={mode === 'analyst' ? 'is-selected' : ''} onClick={() => setMode('analyst')}><LockKeyhole size={13} />{t.analyst}</button><button type="button" className="oculix-pin-button" onClick={pinSnapshot}>{snapshot ? <Check size={13} /> : <Archive size={13} />}{snapshot ? t.pinned : t.pin}</button></div>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Clock3 size={14} />{t.timeline}</span><small>{snapshot ? `${t.snapshot} ${new Date().toLocaleTimeString(language === 'ar' ? 'ar' : 'en')}` : t.current}</small></div><p className="oculix-analyst-hint">{t.timelineHint}</p>{timeline.length === 0 ? <p className="oculix-analyst-hint">{t.noEvents}</p> : <div className="oculix-timeline-events">{timeline.slice(0, 8).map(event => <button type="button" key={event.id} onClick={() => { if (Number.isFinite(event.lat) && Number.isFinite(event.lng)) onLocate?.(event.lat!, event.lng!); }}><span className="oculix-timeline-dot" /><span><strong>{event.title}</strong><small>{t.kind[event.kind]} · {event.source} · {new Date(event.timestamp).toLocaleString(language === 'ar' ? 'ar' : 'en')}</small></span></button>)}</div>}<div className="oculix-analyst-metrics"><Metric label={t.flight} value={currentMetrics.flights} /><Metric label={t.quake} value={currentMetrics.earthquakes} /><Metric label={t.fire} value={currentMetrics.fires} /><Metric label={t.satellite} value={currentMetrics.satellites} /><Metric label={t.news} value={currentMetrics.news} /></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><GitBranch size={14} />{t.correlation}</span><small>{t.review}</small></div><button type="button" className="oculix-ai-button" onClick={() => void analyzeSnapshot()} disabled={aiLoading}><Sparkles size={13} />{aiLoading ? t.analyzing : t.analyze}</button><div className={`oculix-correlation-card ${correlation.found ? 'is-detected' : ''}`}><ShieldAlert size={16} /><div><strong>{correlation.found ? t.possible : t.empty}</strong><p>{t.correlationHint}</p>{correlation.found && <small>{correlation.evidence.map(event => `${event.source}: ${event.title}`).join(' · ')}</small>}</div></div>{aiOverview && <div className="oculix-ai-overview">{aiOverview}</div>}</section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Network size={14} />{t.graph}</span><small>{t.graphHint}</small></div><div className="oculix-entity-graph"><div className="oculix-entity-node is-root">{t.snapshot}</div><div className="oculix-entity-links"><span><i />{t.flight}: {currentMetrics.flights}</span><span><i />{t.quake}: {currentMetrics.earthquakes}</span><span><i />{t.news}: {currentMetrics.news}</span><span><i />{t.source}: {timeline[0]?.source || t.empty}</span></div></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Link2 size={14} />{t.evidence}</span><small>{t.evidenceHint}</small></div><div className="oculix-evidence-chain"><span>{timeline[0]?.source || t.source}</span><i>→</i><span>{timeline[0]?.title || t.result}</span><i>→</i><span>{timeline[0]?.timestamp || t.timestamp}</span></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><BookmarkPlus size={14} />{t.newInvestigation}</span><small>{t.saved}: {saved.length}</small></div><div className="oculix-investigation-form"><input value={title} onChange={event => setTitle(event.target.value)} placeholder={t.titleLabel} /><input value={target} onChange={event => setTarget(event.target.value)} placeholder={t.target} /><input value={area} onChange={event => setArea(event.target.value)} placeholder={t.area} /><select value={timeRange} onChange={event => setTimeRange(event.target.value)}><option value="hour">{t.ranges.hour}</option><option value="day">{t.ranges.day}</option><option value="week">{t.ranges.week}</option><option value="custom">{t.ranges.custom}</option></select><textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={t.notes} rows={3} /><div className="oculix-investigation-actions"><button type="button" onClick={saveInvestigation}><Save size={13} />{t.save}</button><button type="button" className="secondary" onClick={generateReport}><FileText size={13} />{t.report}</button></div></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Archive size={14} />{t.saved}</span>{shareMessage && <small className="oculix-analyst-share-message">{shareMessage}</small>}</div>{saved.length === 0 ? <p className="oculix-analyst-hint">{t.noSaved}</p> : <div className="oculix-investigation-list">{saved.slice(0, 5).map(item => <div className="oculix-investigation-entry" key={item.id}><button type="button" onClick={() => { setTitle(item.title); setTarget(item.target); setArea(item.area); setTimeRange(item.timeRange); setNotes(item.notes); setSnapshot(item.snapshot); setMode('analyst'); }}><strong>{item.title}</strong><small>{item.id} · {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en')} · {item.timeline.length} {t.entities}</small></button><button type="button" className="oculix-share-investigation" onClick={() => void shareInvestigation(item)} aria-label={t.share} title={t.share}><Link2 size={14} /></button></div>)}</div>}</section>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div><strong>{value.toLocaleString()}</strong><span>{label}</span></div>; }
