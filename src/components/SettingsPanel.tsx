'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, Eye, Languages, Map, Moon, Palette, RotateCcw, Settings2, ShieldCheck, Sparkles, Volume2, VolumeX, X, Zap } from 'lucide-react';
import type { OculixTheme } from '@/lib/theme';

type Lang = 'ar' | 'en';
type PanelVisibility = Record<string, boolean>;
type VisualOptions = { reducedMotion: boolean; grid: boolean; scanlines: boolean; ticker: boolean; ambient: boolean };

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  language: Lang;
  setLanguage: (value: Lang) => void;
  theme: OculixTheme;
  setTheme: (value: OculixTheme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  visualOptions: VisualOptions;
  setVisualOptions: (value: VisualOptions) => void;
  pwaInstalled: boolean;
  panelVisibility: PanelVisibility;
  setPanelVisibility: (key: string, value: boolean) => void;
  onResetPanels: () => void;
}

type GuideStep = { title: string; body: string };

const copy = {
  ar: {
    title: 'مركز إعدادات Oculix', eyebrow: 'OX / لوحة التحكم', subtitle: 'تحكم كامل بالعرض — لا يتم حذف أي ميزة', appearance: 'المظهر والهوية', language: 'لغة الواجهة', arabic: 'العربية', english: 'English', theme: 'الثيم', core: 'جوهر Oculix', ghost: 'بروتوكول الشبح', aurora: 'إشارة الشفق', ember: 'مركز الجمر', audio: 'المؤثرات الصوتية', enabled: 'مفعلة', disabled: 'متوقفة', workspace: 'مساحة العمل', reset: 'إعادة الإعدادات الافتراضية', close: 'إغلاق', visible: 'ظاهر', hidden: 'مخفي', note: 'الإخفاء هنا مؤقت للواجهة فقط؛ كل الأدوات والميزات الأصلية محفوظة.', motion: 'الحركة', reduced: 'مخفّضة', effects: 'المؤثرات المرئية', grid: 'الشبكة', scanlines: 'خطوط المسح', ticker: 'شريط الحالة', ambient: 'الجو الحي', pwa: 'التطبيق القابل للتثبيت', installed: 'مثبت على هذا الجهاز', browser: 'يعمل داخل المتصفح', rights: 'من صنع Abdullah Qatan', on: 'تشغيل', off: 'إيقاف', guide: 'كيف أستعمل المنصة', guideIntro: 'دليل عملي شامل لفهم الخريطة والطبقات والأقسام وأدوات التحليل خطوة بخطوة.', guideTip: 'ابدأ من الخريطة، ثم فعّل الطبقات التي تحتاجها فقط. كل بطاقة تفتح فوق الخريطة ويمكن إغلاقها والعودة إلى السياق نفسه.', guideData: 'تنبيه مهم: الأخبار والأسعار ومصادر الكاميرات بيانات خارجية حية؛ قد تتأخر أو تتوقف مؤقتاً بحسب المصدر، لكن أدوات المنصة المحلية تبقى متاحة.',
  },
  en: {
    title: 'Oculix Settings', eyebrow: 'OX / CONTROL DECK', subtitle: 'Full display control — no feature is deleted', appearance: 'Appearance & identity', language: 'Interface language', arabic: 'العربية', english: 'English', theme: 'Theme', core: 'Oculix Core', ghost: 'Ghost Protocol', aurora: 'Aurora Signal', ember: 'Ember Command', audio: 'Sound feedback', enabled: 'Enabled', disabled: 'Disabled', workspace: 'Workspace', reset: 'Reset display defaults', close: 'Close', visible: 'Visible', hidden: 'Hidden', note: 'Visibility is temporary display control; every original tool and feature remains preserved.', motion: 'Motion', reduced: 'Reduced', effects: 'Visual effects', grid: 'Grid', scanlines: 'Scanlines', ticker: 'Status ticker', ambient: 'Ambient field', pwa: 'Installable app', installed: 'Installed on this device', browser: 'Running in browser', rights: 'Made by Abdullah Qatan', on: 'On', off: 'Off', guide: 'How to use the platform', guideIntro: 'A complete practical guide to the map, layers, intelligence panels and analysis tools.', guideTip: 'Start with the map, then enable only the layers you need. Every card opens over the map and can be closed without losing the current context.', guideData: 'Important: news, prices and camera sources are live external data. A provider may delay or temporarily block a feed while the local platform tools remain available.',
  },
} as const;

const panelLabels = {
  ar: { layers: 'الطبقات', markets: 'الأسواق', alerts: 'التنبيهات', space: 'بث الفضاء', scm: 'مركز الأمان', intel: 'موجز المعلومات', drawing: 'أدوات الرسم', remote: 'التحكم البعيد', arcgis: 'طبقات ArcGIS', directions: 'المسارات', search: 'البحث' },
  en: { layers: 'Layers', markets: 'Markets', alerts: 'Alerts', space: 'Space broadcast', scm: 'Security center', intel: 'Intel feed', drawing: 'Drawing tools', remote: 'World Remote', arcgis: 'ArcGIS layers', directions: 'Directions', search: 'Search' },
} as const;

const guide = {
  ar: [
    { title: '1. ابدأ من الخريطة', body: 'الخريطة هي مساحة العمل الرئيسية. اسحب للتنقل، استخدم عجلة الفأرة أو أزرار التكبير، وانقر على الكيانات لرؤية التفاصيل. زر 3D يعرض الكرة الأرضية، وزر 2D يفتح إسقاطاً مسطحاً. زر MAP يعيد الخريطة الداكنة، وSAT يعرض صور الأقمار الصناعية عندما تكون الشبكة متاحة.' },
    { title: '2. افهم الطبقات والإحصاءات', body: 'افتح طبقات الخريطة من الشريط الجانبي في سطح المكتب أو من تبويب الطبقات على الهاتف. كل مجموعة تحتوي مفاتيح مستقلة للطيران، الملاحة البحرية، الأقمار الصناعية، الكاميرات، الطقس، الزلازل، الحرائق، البنية التحتية، التهديدات، والشبكات. شغّل الطبقة المطلوبة ثم راقب عدد الكيانات في لوحة الإحصاءات؛ إيقاف طبقة يخفف ازدحام الخريطة ولا يحذف مصدرها.' },
    { title: '3. الاستطلاع والاستخبارات', body: 'يفتح Recon أدوات البحث الأمني مثل IP وDNS وWHOIS والشهادات وBGP والنطاقات الفرعية وعمليات المسح. أدخل قيمة واضحة، اختر نوع الفحص، ثم راجع النتائج والدرجة والمصادر. بعض الفحوص تتطلب إعدادات backend أو مفاتيح مزود خارجي؛ ظهور رسالة عدم التوفر يعني أن المصدر غير مهيأ وليس أن بقية المنصة متوقفة.' },
    { title: '4. الأسواق وطقس الفضاء', body: 'تعرض Markets & Intel مؤشرات السوق والدفاع والطاقة والسلع والعملات الرقمية وFX، إضافة إلى اتساع السوق وطقس الفضاء ونظرة الذكاء الاصطناعي. استخدم التبويبات لتصفية الفئة، وانقر على الرمز لعرض الرسم والتاريخ عندما يصل مزود الأسعار. القيم والأسعار حية وقد تتغير أو تتأخر بحسب المصدر.' },
    { title: '5. التنبيهات والموجزات', body: 'تجمع Live Alerts الأخبار والزلازل والموجزات الخارجية في بطاقة واحدة مع مرشحات All وNews وQuakes وFeeds. افتح رابط المصدر للتحقق من الخبر الأصلي، واستخدم Locate إن توفر إحداثي لإعادة تمركز الخريطة. محتوى المصادر الخارجية يُعرض كما ورد ولا تتم ترجمته أو إعادة صياغته آلياً.' },
    { title: '6. بث الفضاء والكاميرات', body: 'يفتح Space بثاً من مصادر عامة مرتبطة بالفضاء، وتعرض كاميرات المراقبة صورة أو بثاً بحسب قدرة المصدر. إذا منع YouTube أو مزود الكاميرا التضمين فستظل بطاقة المصدر ومسار الفتح الخارجي متاحين. لا تعتبر رسالة bot أو تسجيل الدخول من المنصة خطأً محلياً.' },
    { title: '7. الرسم ومناطق الاهتمام', body: 'استخدم Draw لاختيار Area أو Box أو Radius أو Path ثم انقر على الخريطة. تظهر المساحة أو المسافة والكيانات الموجودة داخل المنطقة، ويمكن تسمية الشكل ومراقبته وتصديره بصيغة GeoJSON. زر الإلغاء ينهي وضع الرسم، ولا يزيل الأشكال المحفوظة إلا عند طلب ذلك.' },
    { title: '8. المسارات والبحث', body: 'يفتح Route مخطط الاتجاهات؛ أدخل نقطة البداية والوجهة أو استخدم موقع الجهاز إذا سمح المتصفح. يعرض النظام المسار والبدائل، ويمكن بدء وضع الملاحة ومتابعة الموقع. يفتح Search بحث الأماكن والإحداثيات وإعادة تمركز الخريطة. يحتاج تحديد الموقع إلى HTTPS أو localhost وموافقة المتصفح.' },
    { title: '9. ArcGIS والتحكم البعيد', body: 'يتيح ArcGIS البحث في طبقات جغرافية عامة واستيرادها للخريطة مع التحكم في اللون والشفافية والظهور. يتيح World Remote اكتشاف أجهزة Bluetooth القريبة إن دعم المتصفح ذلك؛ لا يتم الاتصال بأي جهاز دون تفاعل واضح وموافقة المستخدم. هذه أدوات إضافية ولا تؤثر في بقية الخريطة عند إغلاقها.' },
    { title: '10. الإعدادات وPWA', body: 'من Settings اختر العربية أو English، ثم اختر الثيم والمؤثرات والحركة والصوت. مفاتيح الشبكة وخطوط المسح وشريط الحالة تغيّر العرض فقط. تحكم اللوحات يخفيها مؤقتاً؛ استخدم إعادة الإعدادات الافتراضية لاسترجاع تخطيط v9. لتثبيت Oculix افتح الموقع عبر HTTPS أو localhost واستخدم زر التثبيت الذي يعرضه المتصفح.' },
  ] satisfies readonly GuideStep[],
  en: [
    { title: '1. Start with the map', body: 'The map is the main workspace. Drag to move, use the wheel or zoom controls, and select entities for details. 3D shows the globe, 2D switches to a flat projection, MAP restores the dark map, and SAT uses satellite imagery when available.' },
    { title: '2. Understand layers and stats', body: 'Open map layers from the desktop rail or the mobile Layers tab. Groups cover aviation, maritime, satellites, cameras, weather, quakes, fires, infrastructure, threats and networks. Toggle only what you need and watch the entity counts; disabling a layer reduces clutter without deleting its source.' },
    { title: '3. Recon and intelligence', body: 'Recon exposes IP, DNS, WHOIS, certificates, BGP, subdomain and scanning tools. Enter a clear value, choose a scan mode, and review results, risk and sources. Some scans require a configured backend or provider key; an unavailable source does not stop the rest of the platform.' },
    { title: '4. Markets and space weather', body: 'Markets & Intel shows indices, defense, energy, commodities, crypto and FX, plus breadth, space weather and an AI overview. Use category tabs and select an instrument for its chart when price history is available. Live values can change or lag with the upstream provider.' },
    { title: '5. Alerts and feeds', body: 'Live Alerts combines news, earthquakes and external feeds with All, News, Quakes and Feeds filters. Open a source link to verify the original report and use Locate when coordinates are provided. External payloads are displayed as received and are not blindly translated.' },
    { title: '6. Space streams and cameras', body: 'Space opens public space-related sources, while camera panels show a snapshot or stream according to provider capability. If YouTube or a camera blocks embedding, the source card and external open path remain available. A provider bot or sign-in message is not a local platform failure.' },
    { title: '7. Drawing and areas of interest', body: 'Use Draw to choose Area, Box, Radius or Path and click the map. The panel reports area or distance and entities inside the selection; shapes can be named, watched and exported as GeoJSON. Cancel exits drawing mode without deleting saved shapes.' },
    { title: '8. Routing and search', body: 'Route opens the directions planner. Enter an origin and destination or allow browser location, inspect alternatives, then start navigation if desired. Search finds places and coordinates and recenters the map. Location access requires HTTPS or localhost and browser permission.' },
    { title: '9. ArcGIS and World Remote', body: 'ArcGIS searches public geospatial layers and imports them with color, opacity and visibility controls. World Remote can discover nearby Bluetooth devices when the browser supports it; no device is contacted without an explicit user action. Both are additive tools and can be closed safely.' },
    { title: '10. Settings and PWA', body: 'Use Settings to choose Arabic or English, a theme, visual effects, motion and sound. Grid, scanlines and ticker change presentation only. Panel visibility is temporary; Reset display defaults restores the v9 arrangement. Install Oculix from a secure HTTPS or localhost origin using the browser install control.' },
  ] satisfies readonly GuideStep[],
} as const;

export default function SettingsPanel({ open, onClose, language, setLanguage, theme, setTheme, soundEnabled, setSoundEnabled, visualOptions, setVisualOptions, pwaInstalled, panelVisibility, setPanelVisibility, onResetPanels }: SettingsPanelProps) {
  const t = copy[language];
  const labels = panelLabels[language];
  const panels = Object.keys(labels) as Array<keyof typeof labels>;
  const steps = guide[language];
  const setVisual = (key: keyof VisualOptions, value: boolean) => setVisualOptions({ ...visualOptions, [key]: value });
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="oculix-settings-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside className="oculix-settings-panel" dir={language === 'ar' ? 'rtl' : 'ltr'} initial={{ opacity: 0, x: language === 'ar' ? 32 : -32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: language === 'ar' ? 32 : -32 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }} onClick={event => event.stopPropagation()} aria-label={t.title}>
            <header className="oculix-settings-head"><div><span dir="ltr" className="oculix-settings-eyebrow"><Settings2 size={13} /> {t.eyebrow}</span><h2>{t.title}</h2><p>{t.subtitle}</p></div><button type="button" className="oculix-settings-close" onClick={onClose} aria-label={t.close}><X size={18} /></button></header>

            <section className="oculix-settings-section"><h3><Palette size={15} />{t.appearance}</h3>
              <div className="oculix-settings-row"><span><Languages size={15} />{t.language}</span><div className="oculix-segmented"><button type="button" className={language === 'ar' ? 'is-selected' : ''} onClick={() => setLanguage('ar')}>{t.arabic}</button><button type="button" className={language === 'en' ? 'is-selected' : ''} onClick={() => setLanguage('en')}>{t.english}</button></div></div>
              <div className="oculix-settings-row oculix-settings-theme-row"><span><Moon size={15} />{t.theme}</span><div className="oculix-theme-grid"><button type="button" className={theme === 'core' ? 'is-selected' : ''} onClick={() => setTheme('core')}>{t.core}</button><button type="button" className={theme === 'ghost' ? 'is-selected' : ''} onClick={() => setTheme('ghost')}>{t.ghost}</button><button type="button" className={theme === 'aurora' ? 'is-selected' : ''} onClick={() => setTheme('aurora')}>{t.aurora}</button><button type="button" className={theme === 'ember' ? 'is-selected' : ''} onClick={() => setTheme('ember')}>{t.ember}</button></div></div>
              <div className="oculix-settings-row"><span>{soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}{t.audio}</span><button type="button" className={`oculix-toggle ${soundEnabled ? 'is-on' : ''}`} onClick={() => setSoundEnabled(!soundEnabled)}><i />{soundEnabled ? t.enabled : t.disabled}</button></div>
              <div className="oculix-settings-row"><span><Zap size={15} />{t.motion}</span><button type="button" className={`oculix-toggle ${visualOptions.reducedMotion ? 'is-on' : ''}`} onClick={() => setVisual('reducedMotion', !visualOptions.reducedMotion)}><i />{visualOptions.reducedMotion ? t.reduced : t.enabled}</button></div>
              <div className="oculix-settings-row"><span><Eye size={15} />{t.effects}</span><div className="oculix-mini-options"><button type="button" className={visualOptions.grid ? 'is-selected' : ''} onClick={() => setVisual('grid', !visualOptions.grid)}>{t.grid}</button><button type="button" className={visualOptions.scanlines ? 'is-selected' : ''} onClick={() => setVisual('scanlines', !visualOptions.scanlines)}>{t.scanlines}</button><button type="button" className={visualOptions.ticker ? 'is-selected' : ''} onClick={() => setVisual('ticker', !visualOptions.ticker)}>{t.ticker}</button><button type="button" className={visualOptions.ambient ? 'is-selected' : ''} onClick={() => setVisual('ambient', !visualOptions.ambient)}>{t.ambient}</button></div></div>
            </section>

            <section className="oculix-settings-section"><h3><Settings2 size={15} />{t.workspace}</h3><p className="oculix-settings-note">{t.note}</p><div className="oculix-panel-grid">{panels.map(key => <button key={key} type="button" className={`oculix-panel-chip ${panelVisibility[key] ? 'is-visible' : ''}`} onClick={() => setPanelVisibility(key, !panelVisibility[key])}><span>{panelVisibility[key] ? <Check size={13} /> : <i />}{labels[key]}</span><small>{panelVisibility[key] ? t.visible : t.hidden}</small></button>)}</div><button type="button" className="oculix-reset-button" onClick={onResetPanels}><RotateCcw size={13} />{t.reset}</button></section>

            <section className="oculix-settings-section oculix-guide-section"><h3><BookOpen size={15} />{t.guide}</h3><p className="oculix-settings-note">{t.guideIntro}</p><div className="oculix-guide-callout"><ShieldCheck size={16} /><p>{t.guideTip}</p></div><div className="oculix-guide-list">{steps.map((step, index) => <details key={step.title} open={index === 0} className="oculix-guide-item"><summary>{step.title}<Sparkles size={13} /></summary><p>{step.body}</p></details>)}</div><div className="oculix-guide-callout oculix-guide-callout--data"><Map size={16} /><p>{t.guideData}</p></div></section>

            <section className="oculix-settings-footer"><div><span className="oculix-settings-eyebrow">PWA / OX-LOCAL</span><strong>{t.pwa}</strong><small>{pwaInstalled ? t.installed : t.browser}</small></div><div className="oculix-rights">{t.rights}</div></section>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
