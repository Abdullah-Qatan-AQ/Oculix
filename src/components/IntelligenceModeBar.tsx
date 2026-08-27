'use client';

import { Activity, Anchor, Crosshair, Flame, Globe2, Network, Satellite, Shield, TimerReset } from 'lucide-react';

type Language = 'ar' | 'en';
export type IntelligenceMode = 'intelligence' | 'aviation' | 'maritime' | 'cyber' | 'conflict' | 'natural' | 'space' | 'infrastructure';

interface IntelligenceModeBarProps {
  language: Language;
  mode: IntelligenceMode;
  onModeChange: (mode: IntelligenceMode) => void;
  timeCursor: number;
  onTimeChange: (value: number) => void;
}

const modes = [
  ['intelligence', 'الاستخبارات', 'INTEL', Activity], ['aviation', 'الطيران', 'AIR', Globe2], ['maritime', 'الملاحة', 'SEA', Anchor], ['cyber', 'السيبراني', 'CYBER', Network], ['conflict', 'النزاعات', 'CONFLICT', Shield], ['natural', 'الأحداث الطبيعية', 'NATURAL', Flame], ['space', 'الفضاء', 'SPACE', Satellite], ['infrastructure', 'البنية التحتية', 'INFRA', Crosshair],
] as const;

export default function IntelligenceModeBar({ language, mode, onModeChange, timeCursor, onTimeChange }: IntelligenceModeBarProps) {
  const isArabic = language === 'ar';
  const date = new Date(timeCursor);
  const relative = timeCursor >= Date.now() - 90_000 ? (isArabic ? 'الآن' : 'NOW') : date.toLocaleString(isArabic ? 'ar' : 'en', { dateStyle: 'short', timeStyle: 'short' });
  return <div className="oculix-mode-bar" dir={isArabic ? 'rtl' : 'ltr'}>
    <div className="oculix-mode-bar-heading"><TimerReset size={13} /><span>{isArabic ? 'عدسة الاستخبارات' : 'INTELLIGENCE LENS'}</span><small>{isArabic ? 'لا تحذف الطبقات؛ تغيّر سياق العرض فقط' : 'Context lens only — original layers remain available'}</small></div>
    <div className="oculix-mode-options">{modes.map(([id, ar, en, Icon]) => <button key={id} type="button" className={mode === id ? 'is-selected' : ''} onClick={() => onModeChange(id)} title={isArabic ? ar : en} aria-label={isArabic ? ar : en}><Icon size={12} /><span>{isArabic ? ar : en}</span></button>)}</div>
    <div className="oculix-time-control"><span>{isArabic ? 'الزمن' : 'TIME'} <strong>{relative}</strong></span><input type="range" min={Date.now() - 7 * 24 * 60 * 60 * 1000} max={Date.now()} step={60_000} value={timeCursor} onChange={event => onTimeChange(Number(event.target.value))} aria-label={isArabic ? 'شريط الزمن' : 'Time slider'} /><button type="button" onClick={() => onTimeChange(Date.now())}>{isArabic ? 'الآن' : 'NOW'}</button></div>
  </div>;
}
