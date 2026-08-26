'use client';

import { useEffect } from 'react';

export default function OculixSoundscape({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let context: AudioContext | null = null;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('button, a, [role="button"]')) return;
      try {
        context ??= new AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(680, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(420, context.currentTime + 0.045);
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.018, context.currentTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.055);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.06);
      } catch { /* Audio is an enhancement; UI must always continue silently. */ }
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => { window.removeEventListener('pointerdown', onPointerDown); context?.close().catch(() => undefined); };
  }, [enabled]);
  return null;
}
