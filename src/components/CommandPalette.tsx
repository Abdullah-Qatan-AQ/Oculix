'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BarChart3, Command, Database, Globe2, Layers3, MapPin, Newspaper, Radar, Route, Search, Settings2, Shield, Satellite, Sparkles, X } from 'lucide-react';

type Language = 'ar' | 'en';
export type CommandId = 'layers' | 'search' | 'markets' | 'intel' | 'recon' | 'route' | 'space' | 'alerts' | 'draw' | 'arcgis' | 'remote' | 'settings' | 'health' | 'analyst' | 'globe' | 'map';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  onRun: (command: CommandId) => void;
}

const copy = {
  ar: { title: 'مركز الأوامر', placeholder: 'ابحث عن أداة أو مكان أو إجراء…', hint: 'اكتب للبحث · Enter للتنفيذ · Esc للإغلاق', noResults: 'لا توجد نتيجة', commands: [
    ['layers', 'الطبقات', 'إدارة طبقات الخريطة', Layers3], ['search', 'البحث العالمي', 'أماكن ومدن وإحداثيات', Search], ['markets', 'الأسواق', 'الأسواق والاستخبارات', BarChart3], ['intel', 'موجز المعلومات', 'أخبار ومعلومات مباشرة', Newspaper], ['recon', 'الاستطلاع', 'أدوات Recon', Radar], ['route', 'المسارات', 'تخطيط الاتجاهات', Route], ['space', 'بث الفضاء', 'الكاميرات والفضاء', Satellite], ['alerts', 'التنبيهات', 'زلازل وأخبار وتنبيهات', Activity], ['draw', 'الرسم', 'مناطق الاهتمام والقياس', MapPin], ['arcgis', 'طبقات ArcGIS', 'استيراد طبقات جغرافية', Database], ['remote', 'التحكم البعيد', 'أجهزة Bluetooth القريبة', Globe2], ['settings', 'الإعدادات', 'اللغة والثيم والمؤثرات', Settings2], ['health', 'صحة المصادر', 'الزمن والعمر والأخطاء', Shield], ['analyst', 'مساحة المحلل', 'Snapshots وتحقيقات وملاحظات', Sparkles], ['globe', 'كرة أرضية ثلاثية الأبعاد', 'تغيير إسقاط الخريطة', Globe2], ['map', 'خريطة ثنائية الأبعاد', 'تغيير إسقاط الخريطة', MapPin],
  ] as const },
  en: { title: 'Command palette', placeholder: 'Search a tool, place or action…', hint: 'Type to search · Enter to run · Esc to close', noResults: 'No results', commands: [
    ['layers', 'Layers', 'Manage map layers', Layers3], ['search', 'Global search', 'Places, cities and coordinates', Search], ['markets', 'Markets', 'Markets and intelligence', BarChart3], ['intel', 'Intel feed', 'Live news and intelligence', Newspaper], ['recon', 'Recon', 'Investigation tools', Radar], ['route', 'Directions', 'Route planning', Route], ['space', 'Space broadcast', 'Space and camera sources', Satellite], ['alerts', 'Alerts', 'Quakes, news and alerts', Activity], ['draw', 'Drawing', 'Areas of interest and measure', MapPin], ['arcgis', 'ArcGIS layers', 'Import geospatial layers', Database], ['remote', 'World Remote', 'Nearby Bluetooth devices', Globe2], ['settings', 'Settings', 'Language, theme and effects', Settings2], ['health', 'Source Health', 'Latency, freshness and errors', Shield], ['analyst', 'Analyst workspace', 'Snapshots, investigations and notes', Sparkles], ['globe', '3D globe', 'Change map projection', Globe2], ['map', '2D map', 'Change map projection', MapPin],
  ] as const },
} as const;

export default function CommandPalette({ open, onClose, language, onRun }: CommandPaletteProps) {
  const t = copy[language];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => t.commands.filter(([, label, description]) => `${label} ${description}`.toLowerCase().includes(query.trim().toLowerCase())), [query, t.commands]);

  useEffect(() => {
    if (!open) return;
    setQuery(''); setSelected(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);
  useEffect(() => { setSelected(index => Math.min(index, Math.max(0, filtered.length - 1))); }, [filtered.length]);

  const runSelected = () => { const item = filtered[selected]; if (!item) return; onRun(item[0]); onClose(); };
  if (!open) return null;
  return <div className="oculix-command-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="oculix-command-palette" dir={language === 'ar' ? 'rtl' : 'ltr'} role="dialog" aria-modal="true" aria-label={t.title} onKeyDown={event => { if (event.key === 'Escape') onClose(); if (event.key === 'ArrowDown') { event.preventDefault(); setSelected(index => Math.min(index + 1, filtered.length - 1)); } if (event.key === 'ArrowUp') { event.preventDefault(); setSelected(index => Math.max(index - 1, 0)); } if (event.key === 'Enter') { event.preventDefault(); runSelected(); } }}>
    <div className="oculix-command-input"><Command size={16} /><input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setSelected(0); }} placeholder={t.placeholder} aria-label={t.placeholder} /><kbd>ESC</kbd><button type="button" onClick={onClose} aria-label={language === 'ar' ? 'إغلاق' : 'Close'}><X size={15} /></button></div>
    <div className="oculix-command-results">{filtered.length === 0 ? <p className="oculix-command-empty">{t.noResults}</p> : filtered.map(([id, label, description], index) => { const Icon = id === 'layers' ? Layers3 : id === 'search' ? Search : id === 'markets' ? BarChart3 : id === 'intel' ? Newspaper : id === 'recon' ? Radar : id === 'route' ? Route : id === 'space' ? Satellite : id === 'alerts' ? Activity : id === 'draw' ? MapPin : id === 'arcgis' ? Database : id === 'remote' ? Globe2 : id === 'settings' ? Settings2 : id === 'health' ? Shield : id === 'analyst' ? Sparkles : id === 'globe' ? Globe2 : MapPin; return <button key={id} type="button" className={index === selected ? 'is-selected' : ''} onMouseEnter={() => setSelected(index)} onClick={() => { onRun(id); onClose(); }}><Icon size={15} /><span><strong>{label}</strong><small>{description}</small></span><kbd>{index < 9 ? `⌘${index + 1}` : ''}</kbd></button>; })}</div>
    <footer>{t.hint}</footer>
  </section></div>;
}
