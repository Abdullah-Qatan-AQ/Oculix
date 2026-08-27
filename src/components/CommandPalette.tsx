'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BarChart3, Bookmark, Command, Database, Globe2, Layers3, MapPin, Newspaper, Radar, Route, Search, Settings2, Shield, Satellite, Sparkles, X } from 'lucide-react';

type Language = 'ar' | 'en';
export type CommandId = 'layers' | 'search' | 'markets' | 'intel' | 'recon' | 'route' | 'space' | 'alerts' | 'draw' | 'arcgis' | 'remote' | 'settings' | 'health' | 'analyst' | 'watchlists' | 'globe' | 'map';
export type SearchItem = { id: string; label: string; description: string; kind: 'aircraft' | 'ship' | 'ip' | 'domain' | 'cve' | 'city' | 'event' | 'news'; lat?: number; lng?: number };

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  onRun: (command: CommandId) => void;
  searchItems?: SearchItem[];
  onSearch?: (item: SearchItem) => void;
  onSearchQuery?: (query: string) => void;
}

const copy = {
  ar: { title: 'مركز الأوامر', placeholder: 'ابحث عن أداة أو طائرة أو سفينة أو IP أو Domain أو CVE…', hint: 'اكتب للبحث · Enter للتنفيذ · Esc للإغلاق', noResults: 'لا توجد نتيجة', entities: 'نتائج من البيانات الحالية', recon: 'فتح هذا الاستعلام في Recon', close: 'إغلاق', commands: [
    ['layers', 'الطبقات', 'إدارة طبقات الخريطة', Layers3], ['search', 'البحث العالمي', 'أماكن ومدن وإحداثيات', Search], ['markets', 'الأسواق', 'الأسواق والاستخبارات', BarChart3], ['intel', 'موجز المعلومات', 'أخبار ومعلومات مباشرة', Newspaper], ['recon', 'الاستطلاع', 'أدوات Recon', Radar], ['route', 'المسارات', 'تخطيط الاتجاهات', Route], ['space', 'بث الفضاء', 'الكاميرات والفضاء', Satellite], ['alerts', 'التنبيهات', 'زلازل وأخبار وتنبيهات', Activity], ['draw', 'الرسم', 'مناطق الاهتمام والقياس', MapPin], ['arcgis', 'طبقات ArcGIS', 'استيراد طبقات جغرافية', Database], ['remote', 'التحكم البعيد', 'أجهزة Bluetooth القريبة', Globe2], ['settings', 'الإعدادات', 'اللغة والثيم والمؤثرات', Settings2], ['health', 'صحة المصادر', 'الزمن والعمر والأخطاء', Shield], ['analyst', 'مساحة المحلل', 'Snapshots وتحقيقات وملاحظات', Sparkles], ['watchlists', 'قوائم المتابعة', 'مناطق الاهتمام وقواعد التنبيه', Bookmark], ['globe', 'كرة أرضية ثلاثية الأبعاد', 'تغيير إسقاط الخريطة', Globe2], ['map', 'خريطة ثنائية الأبعاد', 'تغيير إسقاط الخريطة', MapPin],
  ] as const },
  en: { title: 'Command palette', placeholder: 'Search a tool, aircraft, vessel, IP, domain or CVE…', hint: 'Type to search · Enter to run · Esc to close', noResults: 'No results', entities: 'Matches from current data', recon: 'Open this query in Recon', close: 'Close', commands: [
    ['layers', 'Layers', 'Manage map layers', Layers3], ['search', 'Global search', 'Places, cities and coordinates', Search], ['markets', 'Markets', 'Markets and intelligence', BarChart3], ['intel', 'Intel feed', 'Live news and intelligence', Newspaper], ['recon', 'Recon', 'Investigation tools', Radar], ['route', 'Directions', 'Route planning', Route], ['space', 'Space broadcast', 'Space and camera sources', Satellite], ['alerts', 'Alerts', 'Quakes, news and alerts', Activity], ['draw', 'Drawing', 'Areas of interest and measure', MapPin], ['arcgis', 'ArcGIS layers', 'Import geospatial layers', Database], ['remote', 'World Remote', 'Nearby Bluetooth devices', Globe2], ['settings', 'Settings', 'Language, theme and effects', Settings2], ['health', 'Source Health', 'Latency, freshness and errors', Shield], ['analyst', 'Analyst workspace', 'Snapshots, investigations and notes', Sparkles], ['watchlists', 'Watchlists', 'Areas of interest and alert rules', Bookmark], ['globe', '3D globe', 'Change map projection', Globe2], ['map', '2D map', 'Change map projection', MapPin],
  ] as const },
} as const;

const kindLabels = { ar: { aircraft: 'طائرة', ship: 'سفينة', ip: 'IP', domain: 'نطاق', cve: 'CVE', city: 'مدينة', event: 'حدث', news: 'خبر' }, en: { aircraft: 'Aircraft', ship: 'Vessel', ip: 'IP', domain: 'Domain', cve: 'CVE', city: 'City', event: 'Event', news: 'News' } } as const;

export default function CommandPalette({ open, onClose, language, onRun, searchItems = [], onSearch, onSearchQuery }: CommandPaletteProps) {
  const t = copy[language];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => t.commands.filter(([id, label, description]) => `${id} ${label} ${description}`.toLowerCase().includes(query.trim().toLowerCase())), [query, t.commands]);
  const entityMatches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return searchItems.filter(item => `${item.label} ${item.description} ${item.kind}`.toLowerCase().includes(needle)).slice(0, 8);
  }, [query, searchItems]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => { setQuery(''); setSelected(0); inputRef.current?.focus(); }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const activeIndex = Math.min(selected, Math.max(0, filtered.length - 1));
  const runSelected = () => {
    const item = filtered[activeIndex];
    if (item) { onRun(item[0]); onClose(); return; }
    if (query.trim()) { onSearchQuery?.(query.trim()); onClose(); }
  };
  if (!open) return null;
  return <div className="oculix-command-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="oculix-command-palette" dir={language === 'ar' ? 'rtl' : 'ltr'} role="dialog" aria-modal="true" aria-label={t.title} onKeyDown={event => { if (event.key === 'Escape') onClose(); if (event.key === 'ArrowDown') { event.preventDefault(); setSelected(index => Math.min(index + 1, filtered.length - 1)); } if (event.key === 'ArrowUp') { event.preventDefault(); setSelected(index => Math.max(index - 1, 0)); } if (event.key === 'Enter') { event.preventDefault(); runSelected(); } }}>
    <div className="oculix-command-input"><Command size={16} /><input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setSelected(0); }} placeholder={t.placeholder} aria-label={t.placeholder} /><kbd>ESC</kbd><button type="button" onClick={onClose} aria-label={t.close}><X size={15} /></button></div>
    <div className="oculix-command-results">{filtered.length === 0 && entityMatches.length === 0 && !query.trim() ? <p className="oculix-command-empty">{t.noResults}</p> : filtered.map(([id, label, description], index) => { const Icon = id === 'layers' ? Layers3 : id === 'search' ? Search : id === 'markets' ? BarChart3 : id === 'intel' ? Newspaper : id === 'recon' ? Radar : id === 'route' ? Route : id === 'space' ? Satellite : id === 'alerts' ? Activity : id === 'draw' ? MapPin : id === 'arcgis' ? Database : id === 'remote' ? Globe2 : id === 'settings' ? Settings2 : id === 'health' ? Shield : id === 'analyst' ? Sparkles : id === 'watchlists' ? Bookmark : id === 'globe' ? Globe2 : MapPin; return <button key={id} type="button" className={index === activeIndex ? 'is-selected' : ''} onMouseEnter={() => setSelected(index)} onClick={() => { onRun(id); onClose(); }}><Icon size={15} /><span><strong>{label}</strong><small>{description}</small></span><kbd>{index < 9 ? `⌘${index + 1}` : ''}</kbd></button>; })}
      {entityMatches.length > 0 && <div className="oculix-command-entity-group"><small>{t.entities}</small>{entityMatches.map(item => <button key={item.id} type="button" onClick={() => { onSearch?.(item); onClose(); }}><Search size={14} /><span><strong>{item.label}</strong><small>{kindLabels[language][item.kind]} · {item.description}</small></span><kbd>↗</kbd></button>)}</div>}
      {query.trim() && <button type="button" className="oculix-command-query" onClick={() => { onSearchQuery?.(query.trim()); onClose(); }}><Radar size={14} /><span><strong>{query.trim()}</strong><small>{t.recon}</small></span><kbd>↵</kbd></button>}
    </div>
    <footer>{t.hint}</footer>
  </section></div>;
}
