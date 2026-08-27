'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, BookmarkPlus, Check, Clock3, FileText, GitBranch, Link2, LockKeyhole, Network, Save, ShieldAlert, Sparkles, X } from 'lucide-react';

type Language = 'ar' | 'en';
type Mode = 'live' | 'analyst';

interface Metrics {
  flights: number;
  earthquakes: number;
  fires: number;
  satellites: number;
  news: number;
}

interface Investigation {
  id: string;
  title: string;
  target: string;
  area: string;
  timeRange: string;
  notes: string;
  createdAt: string;
  snapshot: Metrics;
}

interface AnalystWorkspaceProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  metrics: Metrics;
}

const STORAGE_KEY = 'oculix-investigations-v1';

const copy = {
  ar: {
    title: 'مساحة المحلل', kicker: 'وضع المحلل', subtitle: 'أوقف اللحظة، وثّق الأدلة، واحتفظ بسياق التحقيق', live: 'مباشر', analyst: 'محلل', close: 'إغلاق', pin: 'تثبيت اللقطة الحالية', pinned: 'لقطة مثبتة', newInvestigation: 'تحقيق جديد', saved: 'التحقيقات المحفوظة', titleLabel: 'اسم التحقيق', target: 'الهدف', area: 'المنطقة', range: 'النطاق الزمني', notes: 'ملاحظات المحلل', save: 'حفظ التحقيق', report: 'توليد تقرير Markdown', analyze: 'حلّل اللقطة', analyzing: 'جارٍ التحليل…', noSaved: 'لا توجد تحقيقات محفوظة بعد.', timeline: 'الخط الزمني', timelineHint: 'حدد حدثاً من الخريطة أو اللوحات لإظهار مراجعاته هنا.', correlation: 'محرك الارتباط', graph: 'رسم الكيانات', graphHint: 'علاقات استكشافية مبنية على اللقطة الحالية؛ راجع المصدر قبل الاستنتاج.', correlationHint: 'هذه إشارة استكشافية وليست إثباتاً سببياً؛ راجع الأدلة والمصادر قبل الاستنتاج.', possible: 'نشاط مترابط محتمل', evidence: 'سلسلة الأدلة', evidenceHint: 'كل نتيجة يجب أن تُربط بالمصدر والنتيجة والوقت.', source: 'المصدر', result: 'النتيجة', timestamp: 'الوقت', current: 'الحالي', entities: 'الكيانات', snapshot: 'لقطة', flight: 'رحلات', quake: 'زلازل', fire: 'حرائق', satellite: 'أقمار', news: 'أخبار', empty: 'فارغ', review: 'يتطلب مراجعة محلل',
  },
  en: {
    title: 'Analyst Workspace', kicker: 'ANALYST MODE', subtitle: 'Pin the moment, document evidence and preserve investigation context', live: 'LIVE', analyst: 'ANALYST', close: 'Close', pin: 'Pin current snapshot', pinned: 'Snapshot pinned', newInvestigation: 'New investigation', saved: 'Saved investigations', titleLabel: 'Investigation title', target: 'Target', area: 'Area', range: 'Time range', notes: 'Analyst notes', save: 'Save investigation', report: 'Generate Markdown report', analyze: 'Analyze snapshot', analyzing: 'Analyzing…', noSaved: 'No saved investigations yet.', timeline: 'Intelligence timeline', timelineHint: 'Select an event from the map or a panel to show its revisions here.', correlation: 'Correlation engine', graph: 'Entity graph', graphHint: 'Exploratory relationships from the current snapshot; verify sources before concluding.', correlationHint: 'This is an exploratory signal, not causal proof; review evidence and sources before concluding.', possible: 'Possible correlated activity', evidence: 'Evidence chain', evidenceHint: 'Every result should link back to source, result and time.', source: 'Source', result: 'Result', timestamp: 'Timestamp', current: 'Current', entities: 'Entities', snapshot: 'Snapshot', flight: 'Flights', quake: 'Quakes', fire: 'Fires', satellite: 'Satellites', news: 'News', empty: 'Empty', review: 'Requires analyst review',
  },
} as const;

function readSaved(): Investigation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AnalystWorkspace({ open, onClose, language, metrics }: AnalystWorkspaceProps) {
  const t = copy[language];
  const [mode, setMode] = useState<Mode>('analyst');
  const [snapshot, setSnapshot] = useState<Metrics | null>(null);
  const [saved, setSaved] = useState<Investigation[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [area, setArea] = useState('');
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [notes, setNotes] = useState('');
  const [aiOverview, setAiOverview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { if (open) setSaved(readSaved()); }, [open]);

  const currentMetrics = snapshot || metrics;
  const correlation = useMemo(() => {
    const signals = [metrics.flights > 0, metrics.earthquakes > 0, metrics.fires > 0, metrics.news > 0].filter(Boolean).length;
    return signals >= 3;
  }, [metrics]);

  const pinSnapshot = () => setSnapshot({ ...metrics });
  const analyzeSnapshot = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'alerts', payload: { counts: currentMetrics } }) });
      const payload = await response.json() as { overview?: string };
      setAiOverview(payload.overview || t.empty);
    } catch { setAiOverview(t.empty); }
    finally { setAiLoading(false); }
  };
  const generateReport = () => {
    const reportTitle = title.trim() || `${t.newInvestigation} ${saved.length + 1}`;
    const report = [`# Oculix Intelligence Report`, ``, `## ${reportTitle}`, ``, `- ${t.target}: ${target.trim() || t.empty}`, `- ${t.area}: ${area.trim() || t.empty}`, `- ${t.range}: ${timeRange}`, `- ${t.timestamp}: ${new Date().toISOString()}`, ``, `## ${t.snapshot}`, ``, `- ${t.flight}: ${currentMetrics.flights}`, `- ${t.quake}: ${currentMetrics.earthquakes}`, `- ${t.fire}: ${currentMetrics.fires}`, `- ${t.satellite}: ${currentMetrics.satellites}`, `- ${t.news}: ${currentMetrics.news}`, ``, `## ${t.notes}`, ``, notes.trim() || t.empty, ``, `## ${t.evidence}`, ``, `${t.source} → ${t.result} → ${t.timestamp}`, ``, `> ${t.correlationHint}`].join('\\n');
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'oculix-report'}.md`; link.click(); URL.revokeObjectURL(url);
  };

  const saveInvestigation = () => {
    const item: Investigation = { id: `INV-${Date.now().toString(36).toUpperCase()}`, title: title.trim() || `${t.newInvestigation} ${saved.length + 1}`, target: target.trim(), area: area.trim(), timeRange, notes: notes.trim(), createdAt: new Date().toISOString(), snapshot: { ...currentMetrics } };
    const next = [item, ...saved].slice(0, 25);
    setSaved(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTitle(''); setTarget(''); setArea(''); setNotes('');
  };

  if (!open) return null;
  return (
    <aside className="oculix-analyst-workspace" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={t.title}>
      <header className="oculix-analyst-header"><div><div className="oculix-kicker"><Sparkles size={13} /> {t.kicker}</div><h2>{t.title}</h2><p>{t.subtitle}</p></div><button type="button" onClick={onClose} aria-label={t.close} title={t.close}><X size={16} /></button></header>
      <div className="oculix-analyst-modebar"><button type="button" className={mode === 'live' ? 'is-selected' : ''} onClick={() => setMode('live')}><span className="oculix-mode-dot" />{t.live}</button><button type="button" className={mode === 'analyst' ? 'is-selected' : ''} onClick={() => setMode('analyst')}><LockKeyhole size={13} />{t.analyst}</button><button type="button" className="oculix-pin-button" onClick={pinSnapshot}>{snapshot ? <Check size={13} /> : <Archive size={13} />}{snapshot ? t.pinned : t.pin}</button></div>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Clock3 size={14} />{t.timeline}</span><small>{snapshot ? `${t.snapshot} ${new Date().toLocaleTimeString(language === 'ar' ? 'ar' : 'en')}` : t.current}</small></div><p className="oculix-analyst-hint">{t.timelineHint}</p><div className="oculix-timeline"><span /><span /><span /><span /></div><div className="oculix-analyst-metrics"><Metric label={t.flight} value={currentMetrics.flights} /><Metric label={t.quake} value={currentMetrics.earthquakes} /><Metric label={t.fire} value={currentMetrics.fires} /><Metric label={t.satellite} value={currentMetrics.satellites} /><Metric label={t.news} value={currentMetrics.news} /></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><GitBranch size={14} />{t.correlation}</span><small>{t.review}</small></div><button type="button" className="oculix-ai-button" onClick={() => void analyzeSnapshot()} disabled={aiLoading}><Sparkles size={13} />{aiLoading ? t.analyzing : t.analyze}</button><div className={`oculix-correlation-card ${correlation ? 'is-detected' : ''}`}><ShieldAlert size={16} /><div><strong>{correlation ? t.possible : t.empty}</strong><p>{t.correlationHint}</p></div></div>{aiOverview && <div className="oculix-ai-overview">{aiOverview}</div>}</section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Network size={14} />{t.graph}</span><small>{t.graphHint}</small></div><div className="oculix-entity-graph"><div className="oculix-entity-node is-root">{t.snapshot}</div><div className="oculix-entity-links"><span><i />{t.flight}: {currentMetrics.flights}</span><span><i />{t.quake}: {currentMetrics.earthquakes}</span><span><i />{t.news}: {currentMetrics.news}</span><span><i />{t.source}: {t.evidence}</span></div></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Link2 size={14} />{t.evidence}</span><small>{t.evidenceHint}</small></div><div className="oculix-evidence-chain"><span>{t.source}</span><i>→</i><span>{t.result}</span><i>→</i><span>{t.timestamp}</span></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><BookmarkPlus size={14} />{t.newInvestigation}</span><small>{t.saved}: {saved.length}</small></div><div className="oculix-investigation-form"><input value={title} onChange={event => setTitle(event.target.value)} placeholder={t.titleLabel} /><input value={target} onChange={event => setTarget(event.target.value)} placeholder={t.target} /><input value={area} onChange={event => setArea(event.target.value)} placeholder={t.area} /><select value={timeRange} onChange={event => setTimeRange(event.target.value)}><option>Last hour</option><option>Last 24 hours</option><option>Last 7 days</option><option>Custom range</option></select><textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={t.notes} rows={3} /><div className="oculix-investigation-actions"><button type="button" onClick={saveInvestigation}><Save size={13} />{t.save}</button><button type="button" className="secondary" onClick={generateReport}><FileText size={13} />{t.report}</button></div></div></section>
      <section className="oculix-analyst-section"><div className="oculix-analyst-section-title"><span><Archive size={14} />{t.saved}</span></div>{saved.length === 0 ? <p className="oculix-analyst-hint">{t.noSaved}</p> : <div className="oculix-investigation-list">{saved.slice(0, 5).map(item => <button type="button" key={item.id} onClick={() => { setTitle(item.title); setTarget(item.target); setArea(item.area); setTimeRange(item.timeRange); setNotes(item.notes); setSnapshot(item.snapshot); }}><strong>{item.title}</strong><small>{item.id} · {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}</small></button>)}</div>}</section>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div><strong>{value.toLocaleString()}</strong><span>{label}</span></div>; }
