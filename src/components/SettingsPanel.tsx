'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Gauge, Globe2, Layers3, MoonStar, Palette, RotateCcw, Settings2, Sparkles, Sun, X, Zap } from 'lucide-react';

export type OculixLanguage = 'ar' | 'en';
export type OculixUiTheme = 'zenith' | 'aurora' | 'ember' | 'paper';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  language: OculixLanguage;
  setLanguage: (value: OculixLanguage) => void;
  theme: OculixUiTheme;
  setTheme: (value: OculixUiTheme) => void;
  showAdvancedTools: boolean;
  setShowAdvancedTools: (value: boolean) => void;
  showTicker: boolean;
  setShowTicker: (value: boolean) => void;
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  showLayers: boolean;
  setShowLayers: (value: boolean) => void;
  onResetView: () => void;
}

const copy = {
  ar: {
    title: 'مركز التحكم',
    eyebrow: 'OCULIX / PREFERENCES',
    subtitle: 'صمّم مساحة العمل وفق إيقاعك. التغييرات تحفظ تلقائياً على هذا الجهاز.',
    appearance: 'المظهر والهوية',
    language: 'لغة الواجهة',
    themes: 'الثيمات',
    zenith: 'زينيث',
    aurora: 'أورورا',
    ember: 'إمبر',
    paper: 'ورق ناعم',
    display: 'تجربة العرض',
    advanced: 'شريط الأدوات المتقدم',
    advancedHint: 'إظهار أدوات البحث، التحليل، التنبيهات والخرائط الإضافية.',
    layers: 'لوحة الطبقات',
    layersHint: 'فتح لوحة الطبقات تلقائياً عند بدء التشغيل.',
    ticker: 'شريط الإشارات الحية',
    tickerHint: 'عرض موجز الأسواق والزلازل المتحرك أسفل الشاشة.',
    grid: 'شبكة المجال',
    gridHint: 'إظهار شبكة خلفية ناعمة تمنح الخريطة عمقاً بصرياً.',
    motion: 'الحركة والمؤثرات',
    motionHint: 'تقليل الحركات والانتقالات لمن يفضل تجربة ثابتة.',
    data: 'بيانات الجلسة',
    status: 'النظام متصل ويعمل بكفاءة.',
    reset: 'إعادة تمركز الخريطة',
    resetHint: 'إرجاع العرض إلى الكرة الأرضية والموضع العالمي.',
    close: 'إغلاق الإعدادات',
    madeBy: 'من صنع Abdullah Qatan',
    on: 'مفعل',
    off: 'متوقف',
  },
  en: {
    title: 'Control Center',
    eyebrow: 'OCULIX / PREFERENCES',
    subtitle: 'Shape your workspace. Changes are saved automatically on this device.',
    appearance: 'Appearance & identity',
    language: 'Interface language',
    themes: 'Themes',
    zenith: 'Zenith',
    aurora: 'Aurora',
    ember: 'Ember',
    paper: 'Soft paper',
    display: 'Display experience',
    advanced: 'Advanced tool rail',
    advancedHint: 'Show search, analysis, alerts and extended map tools.',
    layers: 'Layer panel',
    layersHint: 'Open the layer panel automatically on startup.',
    ticker: 'Live signal ticker',
    tickerHint: 'Show the moving markets and seismic brief at the bottom.',
    grid: 'Field grid',
    gridHint: 'Show a soft background grid for extra visual depth.',
    motion: 'Motion & effects',
    motionHint: 'Reduce transitions for a calmer, more static experience.',
    data: 'Session data',
    status: 'System connected and operating normally.',
    reset: 'Recenter map',
    resetHint: 'Return to the global globe and default view.',
    close: 'Close settings',
    madeBy: 'Made by Abdullah Qatan',
    on: 'On',
    off: 'Off',
  },
} as const;

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`oc-toggle ${checked ? 'is-on' : ''}`}
    >
      <span />
    </button>
  );
}

export default function SettingsPanel({
  open, onClose, language, setLanguage, theme, setTheme,
  showAdvancedTools, setShowAdvancedTools, showTicker, setShowTicker,
  showGrid, setShowGrid, reducedMotion, setReducedMotion, showLayers,
  setShowLayers, onResetView,
}: SettingsPanelProps) {
  const t = copy[language];
  const rtl = language === 'ar';
  const themes: Array<{ id: OculixUiTheme; name: string; colors: string; Icon: typeof MoonStar }> = [
    { id: 'zenith', name: t.zenith, colors: 'linear-gradient(135deg,#09111F,#75F6CF)', Icon: MoonStar },
    { id: 'aurora', name: t.aurora, colors: 'linear-gradient(135deg,#102238,#8D7AFF)', Icon: Sparkles },
    { id: 'ember', name: t.ember, colors: 'linear-gradient(135deg,#1D1213,#FF8B7B)', Icon: Zap },
    { id: 'paper', name: t.paper, colors: 'linear-gradient(135deg,#F5F0E8,#B7A58B)', Icon: Sun },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="settings-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="settings-panel"
            dir={rtl ? 'rtl' : 'ltr'}
            initial={{ opacity: 0, x: rtl ? -32 : 32, scale: .98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: rtl ? -32 : 32, scale: .98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="settings-header">
              <div className="settings-title-wrap">
                <div className="settings-icon"><Settings2 size={17} /></div>
                <div>
                  <div className="settings-eyebrow">{t.eyebrow}</div>
                  <h2>{t.title}</h2>
                </div>
              </div>
              <button type="button" onClick={onClose} className="settings-close" aria-label={t.close}><X size={18} /></button>
            </header>

            <p className="settings-subtitle">{t.subtitle}</p>

            <section className="settings-section">
              <div className="settings-section-title"><Palette size={15} /><span>{t.appearance}</span></div>
              <div className="settings-field">
                <div className="settings-field-label"><Globe2 size={14} /><span>{t.language}</span></div>
                <div className="segmented-control">
                  <button type="button" className={language === 'ar' ? 'active' : ''} onClick={() => setLanguage('ar')}>العربية</button>
                  <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
                </div>
              </div>
              <div className="settings-field settings-theme-field">
                <div className="settings-field-label"><Sparkles size={14} /><span>{t.themes}</span></div>
                <div className="theme-grid">
                  {themes.map(({ id, name, colors, Icon }) => (
                    <button type="button" key={id} className={`theme-card ${theme === id ? 'active' : ''}`} onClick={() => setTheme(id)}>
                      <span className="theme-swatch" style={{ background: colors }}><Icon size={14} /></span>
                      <span>{name}</span>
                      {theme === id && <Check className="theme-check" size={13} />}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="settings-section">
              <div className="settings-section-title"><Eye size={15} /><span>{t.display}</span></div>
              {[
                { label: t.advanced, hint: t.advancedHint, value: showAdvancedTools, set: setShowAdvancedTools, icon: <Layers3 size={14} /> },
                { label: t.layers, hint: t.layersHint, value: showLayers, set: setShowLayers, icon: <Layers3 size={14} /> },
                { label: t.ticker, hint: t.tickerHint, value: showTicker, set: setShowTicker, icon: <Gauge size={14} /> },
                { label: t.grid, hint: t.gridHint, value: showGrid, set: setShowGrid, icon: <Globe2 size={14} /> },
                { label: t.motion, hint: t.motionHint, value: !reducedMotion, set: (value: boolean) => setReducedMotion(!value), icon: <Zap size={14} /> },
              ].map((item) => (
                <div className="settings-row" key={item.label}>
                  <div className="settings-row-copy"><div className="settings-row-label">{item.icon}{item.label}</div><div className="settings-row-hint">{item.hint}</div></div>
                  <div className="settings-row-action"><span className="settings-state">{item.value ? t.on : t.off}</span><Toggle checked={item.value} onChange={() => item.set(!item.value)} label={item.label} /></div>
                </div>
              ))}
            </section>

            <section className="settings-section settings-session">
              <div className="settings-section-title"><RotateCcw size={15} /><span>{t.data}</span></div>
              <div className="settings-status"><span className="status-dot" />{t.status}</div>
              <button type="button" className="reset-view-button" onClick={() => { onResetView(); onClose(); }}><RotateCcw size={14} /><span>{t.reset}</span><small>{t.resetHint}</small></button>
            </section>

            <footer className="settings-footer"><span className="ox-mini">OX</span><span>{t.madeBy}</span><span className="settings-version">Oculix 5.0</span></footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
