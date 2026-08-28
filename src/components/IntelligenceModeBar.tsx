'use client';

import { Activity, Anchor, Crosshair, Flame, Globe2, Network, Satellite, Shield, TimerReset } from 'lucide-react';
import type { OculixLanguage } from '@/lib/i18n';

type Language = OculixLanguage;
export type IntelligenceMode = 'intelligence' | 'aviation' | 'maritime' | 'cyber' | 'conflict' | 'natural' | 'space' | 'infrastructure';

interface IntelligenceModeBarProps {
  language: Language;
  mode: IntelligenceMode;
  onModeChange: (mode: IntelligenceMode) => void;
  timeCursor: number;
  onTimeChange: (value: number) => void;
}

const modes = [
  ['intelligence', Activity], ['aviation', Globe2], ['maritime', Anchor], ['cyber', Network], ['conflict', Shield], ['natural', Flame], ['space', Satellite], ['infrastructure', Crosshair],
] as const;

type ModeId = (typeof modes)[number][0];

const labels: Record<Language, { title: string; hint: string; time: string; now: string; modes: Record<ModeId, string> }> = {
  ar: { title: 'عدسة الاستخبارات', hint: 'لا تحذف الطبقات؛ تغيّر سياق العرض فقط', time: 'الزمن', now: 'الآن', modes: { intelligence: 'الاستخبارات', aviation: 'الطيران', maritime: 'الملاحة', cyber: 'السيبراني', conflict: 'النزاعات', natural: 'الأحداث الطبيعية', space: 'الفضاء', infrastructure: 'البنية التحتية' } },
  en: { title: 'Intelligence lens', hint: 'Context lens only — original layers remain available', time: 'Time', now: 'NOW', modes: { intelligence: 'Intelligence', aviation: 'Aviation', maritime: 'Maritime', cyber: 'Cyber', conflict: 'Conflicts', natural: 'Natural events', space: 'Space', infrastructure: 'Infrastructure' } },
  es: { title: 'Lente de inteligencia', hint: 'Solo cambia el contexto; las capas originales siguen disponibles', time: 'Tiempo', now: 'AHORA', modes: { intelligence: 'Inteligencia', aviation: 'Aviación', maritime: 'Marítimo', cyber: 'Ciber', conflict: 'Conflictos', natural: 'Eventos naturales', space: 'Espacio', infrastructure: 'Infraestructura' } },
  fr: { title: 'Lentille de renseignement', hint: 'Change le contexte uniquement ; les couches restent disponibles', time: 'Temps', now: 'MAINTENANT', modes: { intelligence: 'Renseignement', aviation: 'Aviation', maritime: 'Maritime', cyber: 'Cyber', conflict: 'Conflits', natural: 'Événements naturels', space: 'Espace', infrastructure: 'Infrastructures' } },
  de: { title: 'Nachrichtenlinse', hint: 'Nur der Kontext ändert sich — alle Ebenen bleiben verfügbar', time: 'Zeit', now: 'JETZT', modes: { intelligence: 'Nachrichten', aviation: 'Luftfahrt', maritime: 'Maritim', cyber: 'Cyber', conflict: 'Konflikte', natural: 'Naturereignisse', space: 'Weltraum', infrastructure: 'Infrastruktur' } },
  tr: { title: 'İstihbarat merceği', hint: 'Yalnızca bağlam değişir; özgün katmanlar kullanılabilir', time: 'Zaman', now: 'ŞİMDİ', modes: { intelligence: 'İstihbarat', aviation: 'Havacılık', maritime: 'Denizcilik', cyber: 'Siber', conflict: 'Çatışmalar', natural: 'Doğal olaylar', space: 'Uzay', infrastructure: 'Altyapı' } },
};

const locales: Record<Language, string> = { ar: 'ar', en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', tr: 'tr-TR' };

export default function IntelligenceModeBar({ language, mode, onModeChange, timeCursor, onTimeChange }: IntelligenceModeBarProps) {
  const t = labels[language];
  const date = new Date(timeCursor);
  const relative = timeCursor >= Date.now() - 90_000 ? t.now : date.toLocaleString(locales[language], { dateStyle: 'short', timeStyle: 'short' });
  return <div className="oculix-mode-bar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <div className="oculix-mode-bar-heading"><TimerReset size={13} /><span>{t.title}</span><small>{t.hint}</small></div>
    <div className="oculix-mode-options">{modes.map(([id, Icon]) => <button key={id} type="button" className={mode === id ? 'is-selected' : ''} onClick={() => onModeChange(id)} title={t.modes[id]} aria-label={t.modes[id]}><Icon size={12} /><span>{t.modes[id]}</span></button>)}</div>
    <div className="oculix-time-control"><span>{t.time} <strong>{relative}</strong></span><input type="range" min={Date.now() - 7 * 24 * 60 * 60 * 1000} max={Date.now()} step={60_000} value={timeCursor} onChange={event => onTimeChange(Number(event.target.value))} aria-label={t.time} /><button type="button" onClick={() => onTimeChange(Date.now())}>{t.now}</button></div>
  </div>;
}
