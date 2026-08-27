'use client';

import { useEffect, useMemo, useState } from 'react';
import { BellRing, Bookmark, Plus, Trash2, X } from 'lucide-react';

type Language = 'ar' | 'en';
type Metrics = { flights: number; earthquakes: number; fires: number; satellites: number; news: number; maxEarthquakeMagnitude?: number };
type RuleId = 'aircraft' | 'earthquake' | 'conflict' | 'satellite' | 'cve';
type Watchlist = { id: string; name: string; focus: string; rule: RuleId; threshold?: number; createdAt: string };

interface WatchlistPanelProps { open: boolean; onClose: () => void; language: Language; metrics: Metrics; }

const STORAGE_KEY = 'oculix-watchlists-v1';
const RULE_IDS: RuleId[] = ['aircraft', 'earthquake', 'conflict', 'satellite', 'cve'];

function isWatchlist(value: unknown): value is Watchlist {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Watchlist>;
  return typeof item.id === 'string' && typeof item.name === 'string' && typeof item.focus === 'string' && typeof item.createdAt === 'string' && typeof item.rule === 'string' && (item.threshold === undefined || typeof item.threshold === 'number') && RULE_IDS.includes(item.rule as RuleId);
}

function readWatchlists(): Watchlist[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isWatchlist).slice(0, 20) : [];
  } catch {
    return [];
  }
}

function writeWatchlists(items: Watchlist[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20))); } catch { /* Private browsing or quota limits do not block the panel. */ }
}

const copy = {
  ar: { title: 'قوائم المتابعة', subtitle: 'احفظ مناطق الاهتمام وقواعد التنبيه محلياً', close: 'إغلاق', name: 'اسم القائمة', focus: 'النطاق أو المنطقة أو الهدف', threshold: 'عتبة الزلزال', add: 'إضافة قائمة', saved: 'المحفوظة', empty: 'لا توجد قوائم متابعة بعد.', rule: 'قاعدة التنبيه', local: 'محلي — بلا إشعارات خلفية', aircraft: 'دخول طائرة إلى المنطقة', earthquake: 'زلزال جديد', conflict: 'ظهور حدث نزاع', satellite: 'مرور قمر صناعي', cve: 'CVE يطابق الهدف', active: 'مفعلة', remove: 'حذف', status: 'الحالة الحالية', flights: 'رحلات', quakes: 'زلازل', note: 'القواعد محفوظة في هذا المتصفح. التوصيل بإشعارات push أو worker دائم يحتاج خدمة نشر مستمرة.' },
  en: { title: 'Saved watchlists', subtitle: 'Save areas of interest and alert rules locally', close: 'Close', name: 'Watchlist name', focus: 'Area, scope or target', threshold: 'Earthquake threshold', add: 'Add watchlist', saved: 'Saved', empty: 'No watchlists yet.', rule: 'Alert rule', local: 'Local — no background notifications', aircraft: 'Aircraft enters area', earthquake: 'New earthquake', conflict: 'Conflict event appears', satellite: 'Satellite pass', cve: 'CVE matches target', active: 'Active', remove: 'Remove', status: 'Current status', flights: 'Flights', quakes: 'Quakes', note: 'Rules are stored in this browser. Push notifications or a permanent worker require a persistent deployment.' },
} as const;

export default function WatchlistPanel({ open, onClose, language, metrics }: WatchlistPanelProps) {
  const t = copy[language];
  const [items, setItems] = useState<Watchlist[]>([]);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [rule, setRule] = useState<RuleId>('aircraft');
  const [threshold, setThreshold] = useState(5);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setItems(readWatchlists()), 0);
    return () => window.clearTimeout(timer);
  }, [open]);
  const save = (next: Watchlist[]) => { const bounded = next.slice(0, 20); setItems(bounded); writeWatchlists(bounded); };
  const add = () => { if (!name.trim()) return; save([{ id: `WL-${Date.now().toString(36).toUpperCase()}`, name: name.trim(), focus: focus.trim(), rule, threshold: rule === 'earthquake' ? Math.max(0, threshold) : undefined, createdAt: new Date().toISOString() }, ...items].slice(0, 20)); setName(''); setFocus(''); };
  const ruleLabel = (id: RuleId) => t[id];
  const activeSignals = useMemo(() => ({ aircraft: metrics.flights > 0, earthquake: metrics.earthquakes > 0, conflict: false, satellite: metrics.satellites > 0, cve: false }), [metrics]);
  const isActive = (item: Watchlist) => item.rule === 'earthquake' ? metrics.earthquakes > 0 && (metrics.maxEarthquakeMagnitude ?? 0) >= (item.threshold ?? 5) : activeSignals[item.rule];
  if (!open) return null;
  return <aside className="oculix-watchlist-panel" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={t.title}>
    <header className="oculix-watchlist-header"><div><div className="oculix-kicker"><Bookmark size={13} /> {language === 'ar' ? 'المتابعة' : 'WATCHLISTS'}</div><h2>{t.title}</h2><p>{t.subtitle}</p></div><button type="button" onClick={onClose} aria-label={t.close} title={t.close}><X size={16} /></button></header>
    <section className="oculix-watchlist-form"><input value={name} onChange={e => setName(e.target.value)} placeholder={t.name} /><input value={focus} onChange={e => setFocus(e.target.value)} placeholder={t.focus} /><select value={rule} onChange={e => setRule(e.target.value as RuleId)}><option value="aircraft">{t.aircraft}</option><option value="earthquake">{t.earthquake}</option><option value="conflict">{t.conflict}</option><option value="satellite">{t.satellite}</option><option value="cve">{t.cve}</option></select><input type="number" min="0" max="10" step="0.1" value={threshold} onChange={e => setThreshold(Number(e.target.value) || 0)} aria-label={t.threshold} placeholder={t.threshold} /><button type="button" onClick={add} disabled={!name.trim()}><Plus size={14} />{t.add}</button></section>
    <div className="oculix-watchlist-status"><BellRing size={14} /><span>{t.local}</span><strong>{t.status}: {metrics.flights} {t.flights} · {metrics.earthquakes} {t.quakes}</strong></div>
    <section className="oculix-watchlist-list"><h3>{t.saved} <span>{items.length}</span></h3>{items.length === 0 ? <p>{t.empty}</p> : items.map(item => <article key={item.id}><div><strong>{item.name}</strong><small>{item.focus || '—'} · {ruleLabel(item.rule)}{item.rule === 'earthquake' ? ` ≥ M${item.threshold ?? 5}` : ''} · {isActive(item) ? t.active : t.local}</small></div><button type="button" onClick={() => save(items.filter(entry => entry.id !== item.id))} aria-label={t.remove} title={t.remove}><Trash2 size={14} /></button></article>)}</section>
    <footer>{t.note}</footer>
  </aside>;
}
