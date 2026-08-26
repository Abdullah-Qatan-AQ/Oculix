'use client';

import { useEffect } from 'react';

const ARABIC_LABELS: Record<string, string> = {
  'CLOSE': 'إغلاق', 'OPEN': 'فتح', 'BACK': 'رجوع', 'NEXT': 'التالي', 'RESET': 'إعادة ضبط', 'SAVE': 'حفظ', 'CANCEL': 'إلغاء', 'CLEAR': 'مسح', 'EXPORT': 'تصدير', 'DOWNLOAD': 'تنزيل', 'RETRY': 'إعادة المحاولة', 'RECONNECT': 'إعادة الاتصال',
  'LOADING': 'جارٍ التحميل', 'NO DATA': 'لا توجد بيانات', 'UNKNOWN': 'غير معروف', 'ACTIVE': 'نشط', 'INACTIVE': 'غير نشط', 'ONLINE': 'متصل', 'OFFLINE': 'غير متصل', 'READY': 'جاهز', 'ERROR': 'خطأ', 'DETAILS': 'التفاصيل', 'SOURCE': 'المصدر', 'TIME': 'الوقت', 'DATE': 'التاريخ', 'STATUS': 'الحالة', 'LIVE': 'مباشر',
  'FLIGHTS': 'الرحلات الجوية', 'MARITIME': 'الملاحة البحرية', 'SATELLITES': 'الأقمار الصناعية', 'CAMERAS': 'الكاميرات', 'EARTHQUAKES': 'الزلازل', 'WEATHER': 'الطقس', 'NEWS': 'الأخبار', 'FIRES': 'الحرائق', 'CYBER': 'الأمن السيبراني', 'CONFLICTS': 'النزاعات', 'SPACE WEATHER': 'طقس الفضاء', 'INFRASTRUCTURE': 'البنية التحتية',
  'SEARCH': 'بحث', 'MARKETS': 'الأسواق', 'INTEL': 'الذكاء', 'RECON': 'الاستطلاع', 'SPACE': 'الفضاء', 'ALERTS': 'التنبيهات', 'DRAW': 'الرسم', 'ROUTE': 'المسار', 'ARCGIS': 'الخرائط المتقدمة', 'REMOTE': 'تحكم بعيد', 'WORLD REMOTE': 'التحكم العالمي', 'SETTINGS': 'الإعدادات', 'SUPPORT': 'دعم', 'LAYERS': 'الطبقات', 'ENTITIES': 'الكيانات', 'CURSOR': 'المؤشر', 'LOCATION': 'الموقع', 'HOVER MAP': 'مرر فوق الخريطة', 'ZOOM': 'التكبير', 'MAP': 'خريطة', 'SAT': 'قمر صناعي', 'START': 'بدء', 'STOP': 'إيقاف', 'PAUSE': 'إيقاف مؤقت', 'PLAY': 'تشغيل', 'VIEW': 'عرض', 'PREVIEW': 'معاينة', 'FULLSCREEN': 'ملء الشاشة', 'COPY': 'نسخ', 'SHARE': 'مشاركة', 'FILTER': 'تصفية', 'ALL': 'الكل', 'MORE': 'المزيد', 'MINIMIZE': 'تصغير', 'MAXIMIZE': 'تكبير', 'FOLLOW': 'متابعة', 'RECenter': 'إعادة تمركز', '3D GLOBE': 'كرة ثلاثية الأبعاد', '2D MAP': 'خريطة ثنائية الأبعاد', 'NIGHT MODE': 'الوضع الليلي', 'SATELLITE VIEW': 'عرض الأقمار الصناعية',
};

function translate(value: string) {
  const trimmed = value.trim();
  if (ARABIC_LABELS[trimmed]) return value.replace(trimmed, ARABIC_LABELS[trimmed]);
  return value;
}

export default function LocaleSurface({ language }: { language: 'ar' | 'en' }) {
  useEffect(() => {
    if (language !== 'ar') return;
    const scan = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) nodes.push(node as Text);
      nodes.forEach((textNode) => {
        const parent = textNode.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) return;
        textNode.nodeValue = translate(textNode.nodeValue || '');
      });
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
