'use client';

import { useRef, useState } from 'react';
import { AudioLines, Volume2, VolumeX } from 'lucide-react';

export default function NexusSplash({ language, visible }: { language: 'ar' | 'en'; visible: boolean }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const ar = language === 'ar';
  if (!visible) return null;
  const playTone = (force = false) => {
    if ((!soundEnabled && !force) || typeof window === 'undefined') return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = audioRef.current || new AudioCtor();
    audioRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(460, ctx.currentTime + .22);
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.045, ctx.currentTime + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .24);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + .27);
  };

  return (
    <div className="nexus-splash" dir={ar ? 'rtl' : 'ltr'}>
      <div className="splash-noise" />
      <div className="splash-grid" />
      <div className="splash-corner splash-corner-tl" /><div className="splash-corner splash-corner-tr" />
      <div className="splash-corner splash-corner-bl" /><div className="splash-corner splash-corner-br" />
      <div className="splash-topline"><span>OX / NEXUS 05</span><span>{ar ? 'بروتوكول الرؤية' : 'VISION PROTOCOL'}</span></div>

      <div className="splash-core" aria-label="Oculix loading">
        <div className="splash-orbit orbit-one"><i /><i /><i /></div>
        <div className="splash-orbit orbit-two"><i /><i /></div>
        <div className="splash-orbit orbit-three"><i /></div>
        <div className="splash-core-glow" />
        <div className="splash-monogram"><img src="/oculix-icon.svg" alt="OX" /></div>
      </div>

      <div className="splash-wordmark" dir="ltr"><span>O</span><span>C</span><span>U</span><span>L</span><span>I</span><span>X</span></div>
      <div className="splash-strapline">{ar ? 'واجهة رؤية عالمية هادئة' : 'A QUIET SURFACE FOR GLOBAL VISION'}</div>
      <div className="splash-progress"><div className="splash-progress-fill" /><div className="splash-progress-ticks"><span>CONNECT</span><span>FUSE</span><span>ORIENT</span><span>READY</span></div></div>

      <div className="splash-data splash-data-left"><span>LAT 34.12</span><span>LNG 18.36</span><span>SYNC 99.98%</span></div>
      <div className="splash-data splash-data-right"><span><i /> 08 STREAMS</span><span><i /> 186 REGIONS</span><span><i /> SIGNAL LOCKED</span></div>
      <button type="button" className={`splash-audio ${soundEnabled ? 'is-on' : ''}`} onClick={() => setSoundEnabled(value => { const next = !value; if (next) setTimeout(() => playTone(true), 0); return next; })} aria-label={soundEnabled ? (ar ? 'إيقاف صوت البدء' : 'Mute boot sound') : (ar ? 'تشغيل صوت البدء' : 'Enable boot sound')}>
        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}<span>{soundEnabled ? (ar ? 'الصوت مفعل' : 'AUDIO ON') : (ar ? 'الصوت متوقف' : 'AUDIO OFF')}</span><AudioLines size={13} />
      </button>
      <div className="splash-bottomline"><span>{ar ? 'منصة Oculix / صنع Abdullah Qatan' : 'OCULIX PLATFORM / MADE BY ABDULLAH QATAN'}</span><span>V5.0.0</span></div>
    </div>
  );
}
