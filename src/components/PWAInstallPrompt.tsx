'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Info, X } from 'lucide-react';
import type { OculixLanguage } from '@/lib/i18n';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const copy: Record<OculixLanguage, { title: string; subtitle: string; install: string; dismiss: string; helpTitle: string; help: string; close: string; installed: string }> = {
  ar: { title: 'ثبّت Oculix على جهازك', subtitle: 'افتحه بسرعة كتطبيق مستقل.', install: 'تثبيت', dismiss: 'إغلاق', helpTitle: 'تثبيت Oculix', help: 'استخدم قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق». يعمل زر التثبيت المباشر عندما يسمح المتصفح بذلك.', close: 'فهمت', installed: 'تطبيق مثبت' },
  en: { title: 'Install Oculix on your device', subtitle: 'Launch it quickly as a standalone app.', install: 'Install', dismiss: 'Dismiss', helpTitle: 'Install Oculix', help: 'Open your browser menu and choose “Add to Home screen” or “Install app”. Direct installation appears when the browser supports it.', close: 'Got it', installed: 'Installed app' },
  es: { title: 'Instala Oculix en tu dispositivo', subtitle: 'Ábrelo rápidamente como una aplicación independiente.', install: 'Instalar', dismiss: 'Cerrar', helpTitle: 'Instalar Oculix', help: 'Abre el menú del navegador y elige «Añadir a la pantalla de inicio» o «Instalar aplicación». La instalación directa aparece cuando el navegador la admite.', close: 'Entendido', installed: 'Aplicación instalada' },
  fr: { title: 'Installez Oculix sur votre appareil', subtitle: 'Ouvrez-le rapidement comme une application autonome.', install: 'Installer', dismiss: 'Fermer', helpTitle: 'Installer Oculix', help: 'Ouvrez le menu du navigateur et choisissez « Ajouter à l’écran d’accueil » ou « Installer l’application ». L’installation directe apparaît si le navigateur la prend en charge.', close: 'Compris', installed: 'Application installée' },
  de: { title: 'Oculix auf dem Gerät installieren', subtitle: 'Schnell als eigenständige App öffnen.', install: 'Installieren', dismiss: 'Schließen', helpTitle: 'Oculix installieren', help: 'Öffnen Sie das Browsermenü und wählen Sie „Zum Startbildschirm hinzufügen“ oder „App installieren“. Die direkte Installation erscheint, wenn der Browser sie unterstützt.', close: 'Verstanden', installed: 'App installiert' },
  tr: { title: 'Oculix’i cihazına yükle', subtitle: 'Bağımsız uygulama olarak hızlıca aç.', install: 'Yükle', dismiss: 'Kapat', helpTitle: 'Oculix’i yükle', help: 'Tarayıcı menüsünü açıp “Ana ekrana ekle” veya “Uygulamayı yükle” seçeneğini kullanın. Doğrudan yükleme, tarayıcı desteklediğinde görünür.', close: 'Anladım', installed: 'Uygulama yüklü' },
};

export default function PWAInstallPrompt({ language }: { language: OculixLanguage }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const t = copy[language];

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent); };
    const handleInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener('beforeinstallprompt', handleInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', handleInstall); window.removeEventListener('appinstalled', handleInstalled); };
  }, []);

  if (installed) return <span className="pwa-installed-badge"><CheckCircle2 size={11} />{t.installed}</span>;
  if (dismissed) return <button type="button" className="pwa-install-access pwa-install-access--quiet" onClick={() => setDismissed(false)}><Download size={15} />{t.install}</button>;

  const install = async () => {
    if (!installEvent) { setHelpOpen(true); return; }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome !== 'accepted') setDismissed(true);
    setInstallEvent(null);
  };

  return <>
    {installEvent ? <div className="pwa-install-prompt" dir={language === 'ar' ? 'rtl' : 'ltr'}><div className="pwa-install-icon"><Download size={16} /></div><div className="pwa-install-copy"><strong>{t.title}</strong><span>{t.subtitle}</span></div><button type="button" className="pwa-install-button" onClick={install}>{t.install}</button><button type="button" className="pwa-dismiss-button" aria-label={t.dismiss} onClick={() => setDismissed(true)}><X size={14} /></button></div> : <button type="button" className="pwa-install-access" dir={language === 'ar' ? 'rtl' : 'ltr'} onClick={install}><Download size={15} />{t.install}</button>}
    {helpOpen && <div className="pwa-install-help-backdrop" role="presentation" onClick={() => setHelpOpen(false)}><section className="pwa-install-help" dir={language === 'ar' ? 'rtl' : 'ltr'} role="dialog" aria-modal="true" aria-label={t.helpTitle} onClick={event => event.stopPropagation()}><div className="pwa-install-help-head"><strong><Info size={16} />{t.helpTitle}</strong><button type="button" aria-label={t.dismiss} onClick={() => setHelpOpen(false)}><X size={15} /></button></div><p>{t.help}</p><button type="button" className="pwa-install-button" onClick={() => setHelpOpen(false)}>{t.close}</button></section></div>}
  </>;
}

export function PWAInstalledBadge({ language }: { language: OculixLanguage }) {
  const [installed, setInstalled] = useState(false);
  useEffect(() => { setInstalled(window.matchMedia('(display-mode: standalone)').matches); }, []);
  if (!installed) return null;
  return <span className="pwa-installed-badge"><CheckCircle2 size={11} />{copy[language].installed}</span>;
}
