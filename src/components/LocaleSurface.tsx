'use client';

import { useEffect } from 'react';

type Language = 'ar' | 'en';

const translations: Record<string, string> = {
  'OPEN SOURCE INTELLIGENCE': 'استخبارات المصادر المفتوحة', 'REAL-TIME GLOBAL MONITORING': 'مراقبة عالمية لحظية', 'FLIGHTS': 'الرحلات الجوية', 'MARITIME': 'الملاحة البحرية', 'SATELLITES': 'الأقمار الصناعية', 'CCTV': 'المراقبة المرئية', 'WEATHER': 'الطقس', 'CYBER THREATS': 'التهديدات السيبرانية', 'MADE BY ABDULLAH QATAN': 'من صنع عبدالله قطن', 'SUPPORT': 'الدعم', 'STATUS': 'الحالة', 'LIVE': 'مباشر', 'LAYERS': 'طبقات', 'ENTITIES': 'كيانات', 'SOLAR': 'شمسي', 'UPTIME': 'وقت التشغيل', 'RECON': 'استطلاع', 'SPACE': 'الفضاء', 'MARKETS': 'الأسواق', 'ALERTS': 'التنبيهات', 'DRAW': 'الرسم', 'ROUTE': 'المسار', 'SEARCH': 'البحث', 'ARCGIS': 'ArcGIS', 'REMOTE': 'التحكم البعيد', 'RECON TOOLKIT': 'حزمة الاستطلاع', 'GLOBAL SWEEP': 'مسح شامل', 'SELF TRACK': 'تتبع ذاتي', 'PORT SCAN': 'فحص المنافذ', 'VULN SWEEP': 'فحص الثغرات', 'SHODAN IOT': 'أجهزة Shodan', 'BGP ROUTE': 'مسار BGP', 'MAC ADDR': 'عنوان MAC', 'DNS': 'نظام DNS', 'WHOIS': 'WHOIS', 'CERTS': 'الشهادات', 'SSL/TLS': 'SSL/TLS', 'SUBDOMAINS': 'النطاقات الفرعية', 'HEADERS': 'رؤوس الأمان', 'TECH DETECT': 'كشف التقنيات', 'USERNAME': 'اسم المستخدم', 'GITHUB RECON': 'استطلاع GitHub', 'PHONE INTEL': 'استخبارات الهاتف', 'THREATS': 'التهديدات', 'DATA LEAKS': 'تسريبات البيانات', 'INFOSTEALER': 'برمجيات سرقة المعلومات', 'CHAIN INTEL': 'استخبارات السلسلة', 'SCAN': 'فحص', 'QUICK SCAN': 'فحص سريع', 'DEEP SCAN': 'فحص عميق', 'TOP 1000 PORTS': 'أهم 1000 منفذ', 'LIVE FROM SPACE': 'بث مباشر من الفضاء', '4K EARTH': 'الأرض 4K', 'EARTH VIEW': 'عرض الأرض', 'OVERVIEW CAM': 'كاميرا عامة', 'SOURCE': 'المصدر', 'ONLINE': 'متصل', 'LOCATION': 'الموقع', 'HOVER MAP': 'مرر فوق الخريطة', 'ZOOM': 'التكبير', 'Press ? for shortcuts · F fullscreen · R reset view': 'اضغط ؟ للاختصارات · F ملء الشاشة · R إعادة العرض', 'OSINT Recon': 'استطلاع OSINT', 'OSINT': 'استخبارات المصادر المفتوحة', 'Settings': 'الإعدادات', 'Enable sound': 'تشغيل الصوت', 'Mute sound': 'إيقاف الصوت', 'Lock focus': 'تثبيت النظرة', 'Open layers': 'فتح الطبقات', 'Version 5.0': 'الإصدار 5.0', 'Oculix Settings': 'إعدادات Oculix', 'Made by Abdullah Qatan': 'من صنع Abdullah Qatan',
};

function translateText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (translations[trimmed]) return value.replace(trimmed, translations[trimmed]);
  return value;
}

export default function LocaleSurface({ language }: { language: Language }) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    const apply = (root: ParentNode) => {
      const nodes = root.querySelectorAll('button, a, h1, h2, h3, h4, span, p, label, option');
      nodes.forEach(node => {
        if (node.childNodes.length !== 1 || node.firstChild?.nodeType !== Node.TEXT_NODE) return;
        const element = node as HTMLElement;
        const current = element.textContent || '';
        const previousTranslation = element.dataset.oculixLastText;
        let original = element.dataset.oculixOriginalText;
        if (!original || (previousTranslation && current !== previousTranslation)) original = current;
        element.dataset.oculixOriginalText = original;
        const next = language === 'ar' ? translateText(original) : original;
        if (next !== current) element.textContent = next;
        element.dataset.oculixLastText = next;
      });
    };
    apply(document.body);
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) apply(node as Element); })));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
