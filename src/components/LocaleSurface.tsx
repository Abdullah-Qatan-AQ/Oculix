'use client';

import { useEffect } from 'react';

type Language = 'ar' | 'en';

// Only stable UI copy belongs here. Live payloads, entity names, market values,
// source names and provider text are intentionally not translated by this layer.
const translations: Record<string, string> = {
  'OPEN SOURCE INTELLIGENCE': 'استخبارات المصادر المفتوحة', 'OCULIX SDK': 'حزمة تطوير Oculix', 'OCULIX': 'Oculix',
  'GLOBAL INTELLIGENCE PLATFORM': 'منصة استخبارات عالمية',
  'REAL-TIME GLOBAL MONITORING': 'مراقبة عالمية لحظية',
  'FLIGHTS': 'الرحلات الجوية', 'MARITIME': 'الملاحة البحرية', 'SATELLITES': 'الأقمار الصناعية',
  'CCTV': 'المراقبة المرئية', 'WEATHER': 'الطقس', 'CYBER THREATS': 'التهديدات السيبرانية',
  'MADE BY ABDULLAH QATAN': 'من صنع عبدالله قطن', 'STATUS': 'الحالة', 'LIVE': 'مباشر',
  'LAYERS': 'الطبقات', 'ENTITIES': 'كيانات', 'SOLAR': 'النشاط الشمسي', 'UPTIME': 'وقت التشغيل',
  'RECON': 'الاستطلاع', 'OSINT Recon': 'استطلاع المصادر المفتوحة', 'SPACE': 'الفضاء', 'AVIATION': 'الطيران', 'SURVEILLANCE': 'المراقبة', 'NATURAL HAZARDS': 'الأخطار الطبيعية', 'THREATS & INTEL': 'التهديدات والاستخبارات', 'NETWORK INTEL': 'استخبارات الشبكات', 'DISPLAY': 'العرض',
  'MARKETS': 'الأسواق', 'MARKETS & INTEL': 'الأسواق والاستخبارات', 'INDICES': 'المؤشرات', 'DEFENSE': 'الدفاع', 'ENERGY': 'الطاقة', 'COMMODITIES': 'السلع', 'CRYPTO': 'العملات الرقمية', 'FX': 'العملات الأجنبية', 'BREADTH': 'اتساع السوق', 'SESSION OPEN': 'الجلسة مفتوحة', 'SESSION CLOSED': 'الجلسة مغلقة', 'BY MOVE': 'حسب الحركة', 'MARKETS & INTEL LIVE': 'الأسواق والاستخبارات مباشر', 'ALERTS': 'التنبيهات',
  'LIVE ALERTS': 'التنبيهات المباشرة', 'OCULIX RECON': 'استطلاع Oculix', 'DRAW': 'الرسم', 'ROUTE': 'المسار', 'SEARCH': 'البحث',
  'ARCGIS': 'ArcGIS', 'REMOTE': 'التحكم البعيد', 'WORLD REMOTE': 'التحكم العالمي البعيد',
  'SIGINT FEED': 'موجز استخبارات الإشارات', 'INTEL FEED': 'موجز المعلومات', 'MARITIME LINES': 'خطوط الملاحة البحرية', 'COMMERCIAL': 'تجاري', 'PRIVATE': 'خاص', 'PRIVATE JETS': 'طائرات خاصة', 'MILITARY': 'عسكري', 'SPACE TRACKING': 'تتبع الفضاء',
  'SETTINGS': 'الإعدادات', 'STATUS:': 'الحالة:', 'ONLINE': 'متصل', 'CONNECTED': 'متصل',
  'CONNECTING': 'جارٍ الاتصال', 'ERROR': 'خطأ', 'LOCATION': 'الموقع', 'HOVER MAP': 'مرّر فوق الخريطة',
  'ZOOM': 'التكبير', 'SOURCE': 'المصدر', 'RESET': 'إعادة الضبط', 'CLOSE': 'إغلاق',
  'DEFAULT': 'افتراضي',
  'AI OVERVIEW': 'نظرة عامة بالذكاء الاصطناعي', 'Latest flare': 'آخر توهج', 'LATEST FLARE': 'آخر توهج', 'just now': 'الآن', 'SPACE WEATHER': 'طقس الفضاء',
  'NEWS': 'الأخبار', 'QUAKES': 'الزلازل',
  'FEEDS': 'الموجزات', 'ALL': 'الكل', 'EXPAND FOR HD ↗': 'توسيع للدقة العالية ↗',
  '4K EARTH': 'الأرض بدقة 4K', 'EARTH VIEW': 'عرض الأرض', 'OVERVIEW CAM': 'الكاميرا العامة',
  'LIVE FROM SPACE': 'بث مباشر من الفضاء', 'DRAWING TOOLS': 'أدوات الرسم',
  'TRACKED AREA': 'المساحة المتتبعة', 'AOIs / PERIM': 'مناطق الاهتمام / المحيط',
  'STEP 1 — CHOOSE A SHAPE': 'الخطوة 1 — اختر شكلاً', 'AREA': 'مساحة', 'BOX': 'مربع',
  'RADIUS': 'نطاق', 'PATH': 'مسار', 'Any shape, corner by corner': 'شكل حر، زاوية تلو الأخرى',
  'Two clicks, opposite corners': 'نقرتان، زاويتان متقابلتان', 'Centre, then distance out': 'مركز ثم مسافة للخارج',
  'Measure a route': 'قياس مسار', 'Choose a shape above, then click the map': 'اختر شكلاً أعلاه، ثم انقر على الخريطة',
  'Layers & Stats': 'الطبقات والإحصاءات',
  'SECURITY CENTER': 'مركز الأمان', 'OPEN IN YOUTUBE': 'فتح في YouTube', 'LIVE STREAM': 'بث مباشر',
  'EXTERNAL ONLY': 'خارجي فقط', 'EMBED RESTRICTED': 'التضمين مقيّد', 'OPEN LIVE STREAM': 'فتح البث المباشر',
  'NO ACTIVE SEARCH': 'لا يوجد بحث نشط', 'SCAN': 'فحص', 'SEARCH ARCGIS LAYERS...': 'ابحث في طبقات ArcGIS...',
  'TRY SEARCHING FOR POWER PLANTS, SUBSTATIONS, EVACUATION ROUTES, OR PIPELINES IN THE DESIGNATED AREA.': 'جرّب البحث عن محطات الطاقة أو المحطات الفرعية أو مسارات الإخلاء أو خطوط الأنابيب في المنطقة المحددة.',
  'Press ? for shortcuts · F fullscreen · R reset view': 'اضغط ؟ للاختصارات · F ملء الشاشة · R إعادة العرض',
  'Query': 'الاستعلام', 'Hostnames': 'أسماء المضيفين', 'Open Ports': 'المنافذ المفتوحة', 'Risk Score': 'درجة الخطورة', 'Malicious': 'ضار', 'Category': 'الفئة',
  'Last Seen': 'آخر ظهور', 'Tags': 'الوسوم', 'CRITICAL': 'حرج', 'HIGH': 'مرتفع',
  'ELEVATED': 'مرتفع نسبياً', 'LOW': 'منخفض', 'YES': 'نعم', 'NO': 'لا',
  'Press ? to see all keyboard shortcuts': 'اضغط ؟ لعرض جميع اختصارات لوحة المفاتيح',
  'Settings': 'الإعدادات', 'Directions': 'الاتجاهات', 'Live from Space': 'بث مباشر من الفضاء', 'Live Alerts': 'التنبيهات المباشرة', 'Draw': 'الرسم', 'Search': 'البحث', 'World Remote': 'التحكم العالمي البعيد', 'Night Mode': 'الوضع الليلي', 'Satellite View': 'عرض الأقمار الصناعية', '3D Globe': 'كرة أرضية ثلاثية الأبعاد', '2D Map': 'خريطة ثنائية الأبعاد', 'Open layers': 'فتح الطبقات', 'Documentation & API Reference': 'التوثيق ومرجع API', 'Docs': 'التوثيق', 'Cursor coordinates (hover over map)': 'إحداثيات المؤشر (مرّر فوق الخريطة)', 'Reverse-geocoded location name': 'اسم الموقع المعكوس جغرافياً', 'Current zoom level': 'مستوى التكبير الحالي', 'Use my location': 'استخدم موقعي', 'Stop live tracking': 'إيقاف التتبع المباشر', 'Track my location live': 'تتبع موقعي مباشرة', 'Stop following': 'إيقاف المتابعة', 'Keep the map centred on me': 'إبقاء الخريطة متمركزة عليّ', 'Close directions': 'إغلاق المسارات', 'Choose starting point': 'اختر نقطة البداية', 'Choose destination': 'اختر الوجهة', 'Swap origin and destination': 'تبديل البداية والوجهة', 'Travel mode': 'وضع التنقل', 'Add a stop': 'إضافة محطة', 'Route options': 'خيارات المسار', 'Hide layer': 'إخفاء الطبقة', 'Show layer': 'إظهار الطبقة', 'Layer settings': 'إعدادات الطبقة', 'Remove Layer': 'إزالة الطبقة', 'Share view (S)': 'مشاركة العرض (S)', 'Close (Esc)': 'إغلاق (Esc)', 'Live video is hosted by the camera operator — opens their page': 'الفيديو المباشر مستضاف لدى مشغل الكاميرا — يفتح صفحته', 'SEARCH ADDRESS, CITY, OR COORDINATES...': 'ابحث عن عنوان أو مدينة أو إحداثيات...', 'Search ArcGIS layers...': 'ابحث في طبقات ArcGIS...', 'Filter tools…': 'تصفية الأدوات…',
};

function translateText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const exact = translations[trimmed] || translations[trimmed.toUpperCase()];
  if (exact) return value.replace(trimmed, exact);
  // Translate only known stable phrases inside compound labels. Entries are
  // longest-first so LIVE STREAM is handled before the shorter LIVE token.
  return Object.entries(translations)
    .filter(([source]) => source.length >= 4)
    .sort((a, b) => b[0].length - a[0].length)
    .reduce((result, [source, target]) => result.split(source).join(target), value);
}

// Keep these maps outside the effect so a language switch can restore the
// original English copy instead of treating the previous Arabic render as new source text.
const originalTextByNode = new WeakMap<Text, string>();
const renderedTextByNode = new WeakMap<Text, string>();
const originalAttributesByElement = new WeakMap<HTMLElement, Record<string, string>>();
const renderedAttributesByElement = new WeakMap<HTMLElement, Record<string, string>>();

export default function LocaleSurface({ language }: { language: Language }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.dataset.locale = language;


    const shouldSkip = (node: Text) => {
      const parent = node.parentElement;
      return !parent || Boolean(parent.closest('script,style,pre,code,input,textarea,[data-oculix-no-translate],[data-oculix-live]'));
    };
    const applyAttributes = (scope: Node) => {
      const elements: HTMLElement[] = [];
      if (scope.nodeType === Node.ELEMENT_NODE) elements.push(scope as HTMLElement);
      if ('querySelectorAll' in scope) elements.push(...Array.from((scope as Element).querySelectorAll<HTMLElement>('*')));
      elements.forEach(element => {
        if (element.closest('[data-oculix-no-translate],[data-oculix-live]')) return;
        const saved = originalAttributesByElement.get(element) || {};
        const lastRendered = renderedAttributesByElement.get(element) || {};
        (['placeholder', 'title', 'aria-label'] as const).forEach(attribute => {
          const value = element.getAttribute(attribute);
          if (!value) return;
          if (!saved[attribute] || (lastRendered[attribute] !== undefined && value !== lastRendered[attribute])) saved[attribute] = value;
          const original = saved[attribute] || value;
          const next = language === 'ar' ? translateText(original) : original;
          if (value !== next) element.setAttribute(attribute, next);
          lastRendered[attribute] = next;
        });
        originalAttributesByElement.set(element, saved);
        renderedAttributesByElement.set(element, lastRendered);
      });
    };
    const apply = (scope: Node) => {
      applyAttributes(scope);
      const nodes: Text[] = [];
      if (scope.nodeType === Node.TEXT_NODE) nodes.push(scope as Text);
      else {
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        let current: Node | null;
        while ((current = walker.nextNode())) nodes.push(current as Text);
      }
      nodes.forEach(node => {
        if (shouldSkip(node)) return;
        const value = node.nodeValue || '';
        const previous = renderedTextByNode.get(node);
        if (!originalTextByNode.has(node) || (previous !== undefined && value !== previous)) originalTextByNode.set(node, value);
        const original = originalTextByNode.get(node) || value;
        const next = language === 'ar' ? translateText(original) : original;
        if (node.nodeValue !== next) node.nodeValue = next;
        renderedTextByNode.set(node, next);
      });
    };

    if (document.body) apply(document.body);
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) apply(record.target);
        record.addedNodes.forEach(node => apply(node));
        if (record.type === 'attributes' && record.target.nodeType === Node.ELEMENT_NODE) apply(record.target);
      });
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
