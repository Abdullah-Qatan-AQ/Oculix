'use client';

import { useRef, useState } from 'react';
import { Activity, AudioLines, Compass, Crosshair, Eye, Gauge, Globe2, Layers3, LayoutDashboard, LocateFixed, Radar, Settings2, ShieldCheck, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';

interface NexusShellProps {
  language: 'ar' | 'en';
  entityCount: number;
  layerCount: number;
  backendStatus: string;
  onSettings: () => void;
  onHome: () => void;
  onMonitor: () => void;
  onExplore: () => void;
  onLayers: () => void;
  onAdvanced: () => void;
  onReset: () => void;
}

const text = {
  ar: {
    eyebrow: 'نظام الرؤية العالمية / هورايزن',
    live: 'بث حي',
    title: 'شاهد العالم\nبوضوح مختلف.',
    subtitle: 'مساحة قيادة هادئة تجمع الإشارات الجوية والبحرية والأمنية والزلزالية في مشهد واحد قابل للفهم.',
    focus: 'تثبيت النظرة',
    layers: 'فتح الطبقات',
    overview: 'نظرة عامة',
    monitor: 'مراقبة',
    explore: 'استكشاف',
    signals: 'إشارات نشطة',
    entities: 'كيانات مرصودة',
    coverage: 'تغطية عالمية',
    uptime: 'جاهزية النظام',
    allSystems: 'كل الأنظمة تعمل',
    soundOn: 'إيقاف الصوت',
    soundOff: 'تشغيل الصوت',
    settings: 'الإعدادات',
    version: 'نسخة 5.0 / صنع عبدالله قطن',
    pulse: 'نبض المنصة',
    hint: 'حرّك الخريطة أو استخدم الاختصارات للتنقل السريع',
  },
  en: {
    eyebrow: 'GLOBAL VISION SYSTEM / HORIZON',
    live: 'LIVE STREAM',
    title: 'See the world\nwith a different clarity.',
    subtitle: 'A calm command surface that fuses air, maritime, security and seismic signals into one legible view.',
    focus: 'Lock focus',
    layers: 'Open layers',
    overview: 'Overview',
    monitor: 'Monitor',
    explore: 'Explore',
    signals: 'Active signals',
    entities: 'Tracked entities',
    coverage: 'Global coverage',
    uptime: 'System uptime',
    allSystems: 'All systems operational',
    soundOn: 'Mute sound',
    soundOff: 'Enable sound',
    settings: 'Settings',
    version: 'Version 5.0 / Made by Abdullah Qatan',
    pulse: 'Platform pulse',
    hint: 'Pan the map or use shortcuts for rapid navigation',
  },
} as const;

export default function NexusShell({ language, entityCount, layerCount, backendStatus, onSettings, onHome, onMonitor, onExplore, onLayers, onAdvanced, onReset }: NexusShellProps) {
  const t = text[language];
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const playTone = (frequency = 480, duration = .08, force = false) => {
    if ((!soundEnabled && !force) || typeof window === 'undefined') return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = audioRef.current || new AudioCtor();
    audioRef.current = ctx;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.18, ctx.currentTime + duration);
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.035, ctx.currentTime + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + .02);
  };

  const action = (callback: () => void, frequency = 480) => {
    playTone(frequency);
    callback();
  };

  const navItems = [
    { icon: LayoutDashboard, label: t.overview, active: true, handler: onHome, frequency: 520 },
    { icon: Radar, label: t.monitor, active: false, handler: onMonitor, frequency: 410 },
    { icon: Compass, label: t.explore, active: false, handler: onExplore, frequency: 450 },
  ];

  return (
    <div className="nexus-ui" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="nexus-aura nexus-aura-one" />
      <div className="nexus-aura nexus-aura-two" />

      <header className="nexus-topbar">
        <div className="nexus-brand">
          <div className="nexus-ox" aria-label="OX"><img src="/oculix-icon.svg" alt="OX" /></div>
          <div className="nexus-brand-copy"><span>{t.eyebrow}</span><strong>Oculix</strong></div>
        </div>
        <div className="nexus-live-status"><span className="nexus-live-dot" /><b>{t.live}</b><span className="nexus-live-rule" /><span className="nexus-live-clock">{new Date().toISOString().slice(11, 19)} Z</span></div>
        <div className="nexus-top-actions">
          <button type="button" className={`nexus-icon-button ${soundEnabled ? 'is-active' : ''}`} onClick={() => setSoundEnabled(value => { const next = !value; if (next) setTimeout(() => playTone(640, .16, true), 0); return next; })} aria-label={soundEnabled ? t.soundOn : t.soundOff} title={soundEnabled ? t.soundOn : t.soundOff}>{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
          <button type="button" className="nexus-settings-button" onClick={() => action(onSettings, 620)}><Settings2 size={15} /><span>{t.settings}</span></button>
        </div>
      </header>

      <nav className="nexus-rail" aria-label={t.overview}>
        <div className="nexus-rail-line" />
        {navItems.map(({ icon: Icon, label, active, handler, frequency }) => <button type="button" key={label} className={`nexus-nav-item ${active ? 'is-active' : ''}`} onClick={() => action(handler, frequency)}><Icon size={17} /><span>{label}</span></button>)}
        <div className="nexus-rail-spacer" />
        <button type="button" className="nexus-nav-item" onClick={() => action(onLayers, 440)}><Layers3 size={17} /><span>{t.layers}</span></button>
      </nav>

      <section className="nexus-hero">
        <div className="nexus-kicker"><Sparkles size={13} /><span>{t.pulse}</span><i /></div>
        <h2>{t.title.split('\n').map((line, index) => <span key={line} className={index === 1 ? 'accent-line' : ''}>{line}</span>)}</h2>
        <p>{t.subtitle}</p>
        <div className="nexus-hero-actions">
          <button type="button" className="nexus-primary-action" onClick={() => action(onReset, 580)}><LocateFixed size={15} />{t.focus}</button>
          <button type="button" className="nexus-secondary-action" onClick={() => action(onLayers, 440)}><Layers3 size={15} />{t.layers}</button>
        </div>
      </section>

      <section className="nexus-metrics" aria-label={t.overview}>
        <div className="nexus-metric-card nexus-metric-featured"><div className="nexus-metric-icon"><Activity size={17} /></div><div><span>{t.signals}</span><strong>{layerCount * 2 + 7}</strong></div><em><Zap size={11} />+12%</em></div>
        <div className="nexus-metric-card"><div className="nexus-metric-icon cyan"><Eye size={17} /></div><div><span>{t.entities}</span><strong>{entityCount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</strong></div></div>
        <div className="nexus-metric-card"><div className="nexus-metric-icon violet"><Globe2 size={17} /></div><div><span>{t.coverage}</span><strong>186<span className="metric-unit"> / 195</span></strong></div></div>
        <div className="nexus-metric-card nexus-uptime"><div className="nexus-metric-icon green"><ShieldCheck size={17} /></div><div><span>{t.uptime}</span><strong>99.98<span className="metric-unit">%</span></strong></div><small><i />{backendStatus === 'connected' ? t.allSystems : backendStatus.toUpperCase()}</small></div>
      </section>

      <footer className="nexus-footer"><div><span className="nexus-footer-mark">OX</span><span>{t.version}</span></div><span className="nexus-footer-hint"><Crosshair size={12} />{t.hint}</span><span className="nexus-footer-coord">34°12′ N / 18°36′ E</span></footer>
    </div>
  );
}
