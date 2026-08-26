'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export default function PWAInstallPrompt({ language }: { language: 'ar' | 'en' }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ar = language === 'ar';

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', handleInstall);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallEvent(null); });
    return () => window.removeEventListener('beforeinstallprompt', handleInstall);
  }, []);

  if (installed || dismissed || !installEvent) return null;

  const install = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome !== 'accepted') setDismissed(true);
    setInstallEvent(null);
  };

  return (
    <div className="pwa-install-prompt" dir={ar ? 'rtl' : 'ltr'}>
      <div className="pwa-install-icon"><Download size={16} /></div>
      <div className="pwa-install-copy"><strong>{ar ? 'ثبّت Oculix على جهازك' : 'Install Oculix on your device'}</strong><span>{ar ? 'افتحه بسرعة كتطبيق مستقل.' : 'Launch it quickly as a standalone app.'}</span></div>
      <button type="button" className="pwa-install-button" onClick={install}>{ar ? 'تثبيت' : 'Install'}</button>
      <button type="button" className="pwa-dismiss-button" aria-label={ar ? 'إغلاق' : 'Dismiss'} onClick={() => setDismissed(true)}><X size={14} /></button>
    </div>
  );
}

export function PWAInstalledBadge({ language }: { language: 'ar' | 'en' }) {
  const [installed, setInstalled] = useState(false);
  useEffect(() => { setInstalled(window.matchMedia('(display-mode: standalone)').matches); }, []);
  if (!installed) return null;
  return <span className="pwa-installed-badge"><CheckCircle2 size={11} />{language === 'ar' ? 'تطبيق مثبت' : 'Installed app'}</span>;
}
