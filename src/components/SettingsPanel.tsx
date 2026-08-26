'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Languages, Moon, Palette, RotateCcw, Settings2, Volume2, VolumeX, X, Zap } from 'lucide-react';

type Theme = 'core' | 'ghost';
type Lang = 'ar' | 'en';
type PanelVisibility = Record<string, boolean>;
type VisualOptions = { reducedMotion: boolean; grid: boolean; scanlines: boolean; ticker: boolean };

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  language: Lang;
  setLanguage: (value: Lang) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  visualOptions: VisualOptions;
  setVisualOptions: (value: VisualOptions) => void;
  pwaInstalled: boolean;
  panelVisibility: PanelVisibility;
  setPanelVisibility: (key: string, value: boolean) => void;
  onResetPanels: () => void;
}

const copy = {
  ar: {
    title: 'مركز إعدادات Oculix', subtitle: 'تحكم كامل بالعرض — لا يتم حذف أي ميزة', appearance: 'المظهر والهوية', language: 'لغة الواجهة', arabic: 'العربية', english: 'English', theme: 'الثيم', core: 'Oculix Core', ghost: 'Ghost Protocol', audio: 'المؤثرات الصوتية', enabled: 'مفعلة', disabled: 'متوقفة', workspace: 'مساحة العمل', reset: 'إعادة الإعدادات الافتراضية', close: 'إغلاق', visible: 'ظاهر', hidden: 'مخفي', note: 'الإخفاء هنا مؤقت للواجهة فقط؛ كل الأدوات والميزات الأصلية محفوظة.', motion: 'الحركة', reduced: 'تقليل الحركة', effects: 'المؤثرات المرئية', grid: 'الشبكة', scanlines: 'خطوط المسح', ticker: 'شريط الحالة', pwa: 'التطبيق القابل للتثبيت', installed: 'مثبت على هذا الجهاز', browser: 'يعمل داخل المتصفح', rights: 'من صنع Abdullah Qatan', on: 'تشغيل', off: 'إيقاف',
  },
  en: {
    title: 'Oculix Settings', subtitle: 'Full display control — no feature is deleted', appearance: 'Appearance & identity', language: 'Interface language', arabic: 'العربية', english: 'English', theme: 'Theme', core: 'Oculix Core', ghost: 'Ghost Protocol', audio: 'Sound feedback', enabled: 'Enabled', disabled: 'Disabled', workspace: 'Workspace', reset: 'Reset display defaults', close: 'Close', visible: 'Visible', hidden: 'Hidden', note: 'Visibility is temporary display control; every original tool and feature remains preserved.', motion: 'Motion', reduced: 'Reduce motion', effects: 'Visual effects', grid: 'Grid', scanlines: 'Scanlines', ticker: 'Status ticker', pwa: 'Installable app', installed: 'Installed on this device', browser: 'Running in browser', rights: 'Made by Abdullah Qatan', on: 'On', off: 'Off',
  },
} as const;

const panelLabels = {
  ar: { layers: 'الطبقات', markets: 'الأسواق', alerts: 'التنبيهات', space: 'بث الفضاء', scm: 'مركز الأمان', intel: 'موجز المعلومات', drawing: 'أدوات الرسم', remote: 'التحكم البعيد', arcgis: 'طبقات ArcGIS', directions: 'المسارات', search: 'البحث' },
  en: { layers: 'Layers', markets: 'Markets', alerts: 'Alerts', space: 'Space broadcast', scm: 'Security center', intel: 'Intel feed', drawing: 'Drawing tools', remote: 'World Remote', arcgis: 'ArcGIS layers', directions: 'Directions', search: 'Search' },
} as const;

export default function SettingsPanel({ open, onClose, language, setLanguage, theme, setTheme, soundEnabled, setSoundEnabled, visualOptions, setVisualOptions, pwaInstalled, panelVisibility, setPanelVisibility, onResetPanels }: SettingsPanelProps) {
  const t = copy[language];
  const labels = panelLabels[language];
  const panels = Object.keys(labels) as Array<keyof typeof labels>;
  const setVisual = (key: keyof VisualOptions, value: boolean) => setVisualOptions({ ...visualOptions, [key]: value });
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="oculix-settings-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside className="oculix-settings-panel" dir={language === 'ar' ? 'rtl' : 'ltr'} initial={{ opacity: 0, x: language === 'ar' ? 32 : -32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: language === 'ar' ? 32 : -32 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }} onClick={event => event.stopPropagation()} aria-label={t.title}>
            <header className="oculix-settings-head"><div><span className="oculix-settings-eyebrow"><Settings2 size={13} /> OX / CONTROL DECK</span><h2>{t.title}</h2><p>{t.subtitle}</p></div><button type="button" className="oculix-settings-close" onClick={onClose} aria-label={t.close}><X size={18} /></button></header>

            <section className="oculix-settings-section"><h3><Palette size={15} />{t.appearance}</h3>
              <div className="oculix-settings-row"><span><Languages size={15} />{t.language}</span><div className="oculix-segmented"><button type="button" className={language === 'ar' ? 'is-selected' : ''} onClick={() => setLanguage('ar')}>{t.arabic}</button><button type="button" className={language === 'en' ? 'is-selected' : ''} onClick={() => setLanguage('en')}>{t.english}</button></div></div>
              <div className="oculix-settings-row"><span><Moon size={15} />{t.theme}</span><div className="oculix-segmented"><button type="button" className={theme === 'core' ? 'is-selected' : ''} onClick={() => setTheme('core')}>{t.core}</button><button type="button" className={theme === 'ghost' ? 'is-selected' : ''} onClick={() => setTheme('ghost')}>{t.ghost}</button></div></div>
              <div className="oculix-settings-row"><span>{soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}{t.audio}</span><button type="button" className={`oculix-toggle ${soundEnabled ? 'is-on' : ''}`} onClick={() => setSoundEnabled(!soundEnabled)}><i />{soundEnabled ? t.enabled : t.disabled}</button></div>
              <div className="oculix-settings-row"><span><Zap size={15} />{t.motion}</span><button type="button" className={`oculix-toggle ${visualOptions.reducedMotion ? 'is-on' : ''}`} onClick={() => setVisual('reducedMotion', !visualOptions.reducedMotion)}><i />{visualOptions.reducedMotion ? t.reduced : t.enabled}</button></div>
              <div className="oculix-settings-row"><span><Eye size={15} />{t.effects}</span><div className="oculix-mini-options"><button type="button" className={visualOptions.grid ? 'is-selected' : ''} onClick={() => setVisual('grid', !visualOptions.grid)}>{t.grid}</button><button type="button" className={visualOptions.scanlines ? 'is-selected' : ''} onClick={() => setVisual('scanlines', !visualOptions.scanlines)}>{t.scanlines}</button><button type="button" className={visualOptions.ticker ? 'is-selected' : ''} onClick={() => setVisual('ticker', !visualOptions.ticker)}>{t.ticker}</button></div></div>
            </section>

            <section className="oculix-settings-section"><h3><Settings2 size={15} />{t.workspace}</h3><p className="oculix-settings-note">{t.note}</p><div className="oculix-panel-grid">{panels.map(key => <button key={key} type="button" className={`oculix-panel-chip ${panelVisibility[key] ? 'is-visible' : ''}`} onClick={() => setPanelVisibility(key, !panelVisibility[key])}><span>{panelVisibility[key] ? <Check size={13} /> : <i />}{labels[key]}</span><small>{panelVisibility[key] ? t.visible : t.hidden}</small></button>)}</div><button type="button" className="oculix-reset-button" onClick={onResetPanels}><RotateCcw size={13} />{t.reset}</button></section>

            <section className="oculix-settings-footer"><div><span className="oculix-settings-eyebrow">PWA / OX-LOCAL</span><strong>{t.pwa}</strong><small>{pwaInstalled ? t.installed : t.browser}</small></div><div className="oculix-rights">{t.rights}</div></section>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
