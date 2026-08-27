'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, MapPin, RefreshCw, X } from 'lucide-react';
import { formatAge, freshnessLabel } from '@/lib/freshness';
import { buildWorldReport, worldReportMarkdown, type WorldReportCategory } from '@/lib/world-report';
import type { OculixLanguage } from '@/lib/i18n';

type Props = { data: Record<string, any>; dataVersion?: number; language: OculixLanguage; onClose: () => void; onLocate?: (lat: number, lng: number) => void };

const copy = {
  ar: { title: 'تقرير الكوكب', subtitle: 'الأحداث التي وصلت من مصادر Oculix خلال آخر 24 ساعة', coverage: 'نطاق التغطية', generated: 'أُنشئ', events: 'أحداث', locations: 'مواقع', sources: 'مصادر', empty: 'لا توجد أحداث مؤرخة ضمن البيانات المحملة حالياً', all: 'الكل', exportMd: 'تصدير Markdown', exportJson: 'تصدير JSON', refresh: 'إعادة بناء التقرير', locate: 'تمركز', source: 'المصدر', age: 'عمر المصدر', confidence: 'الثقة', updated: 'آخر توليد', disclaimer: 'هذا التقرير يلخص ما وصل فعلياً من الموجزات المحملة، ولا يدّعي تغطية كل حدث على الأرض. قد تتأخر المصادر أو تفشل، وتظهر الحالة بوضوح.' },
  en: { title: 'Planet report', subtitle: 'Events received from Oculix feeds during the last 24 hours', coverage: 'Coverage', generated: 'Generated', events: 'Events', locations: 'Locations', sources: 'Sources', empty: 'No timestamped events are currently available in loaded data', all: 'All', exportMd: 'Export Markdown', exportJson: 'Export JSON', refresh: 'Rebuild report', locate: 'Locate', source: 'Source', age: 'Source age', confidence: 'Confidence', updated: 'Last generated', disclaimer: 'This report summarizes what actually arrived from loaded feeds; it does not claim exhaustive coverage of every event on Earth. Providers may delay or fail, and the state is shown explicitly.' },
  es: { title: 'Informe del planeta', subtitle: 'Eventos recibidos de las fuentes de Oculix durante las últimas 24 horas', coverage: 'Cobertura', generated: 'Generado', events: 'Eventos', locations: 'Ubicaciones', sources: 'Fuentes', empty: 'No hay eventos fechados en los datos cargados', all: 'Todos', exportMd: 'Exportar Markdown', exportJson: 'Exportar JSON', refresh: 'Reconstruir informe', locate: 'Centrar', source: 'Fuente', age: 'Antigüedad', confidence: 'Confianza', updated: 'Última generación', disclaimer: 'Este informe resume los datos recibidos de las fuentes cargadas; no afirma una cobertura mundial exhaustiva.' },
  fr: { title: 'Rapport planétaire', subtitle: 'Événements reçus des sources Oculix durant les dernières 24 heures', coverage: 'Couverture', generated: 'Généré', events: 'Événements', locations: 'Lieux', sources: 'Sources', empty: 'Aucun événement horodaté dans les données chargées', all: 'Tous', exportMd: 'Exporter Markdown', exportJson: 'Exporter JSON', refresh: 'Reconstruire', locate: 'Centrer', source: 'Source', age: 'Âge', confidence: 'Confiance', updated: 'Dernière génération', disclaimer: 'Ce rapport résume les données reçues des sources chargées et ne prétend pas couvrir tous les événements mondiaux.' },
  de: { title: 'Planetenbericht', subtitle: 'Ereignisse aus Oculix-Quellen der letzten 24 Stunden', coverage: 'Abdeckung', generated: 'Erstellt', events: 'Ereignisse', locations: 'Orte', sources: 'Quellen', empty: 'Keine zeitgestempelten Ereignisse in den geladenen Daten', all: 'Alle', exportMd: 'Markdown exportieren', exportJson: 'JSON exportieren', refresh: 'Bericht neu erstellen', locate: 'Zentrieren', source: 'Quelle', age: 'Alter', confidence: 'Vertrauen', updated: 'Zuletzt erstellt', disclaimer: 'Dieser Bericht fasst geladene Quellen zusammen und behauptet keine vollständige weltweite Abdeckung.' },
  tr: { title: 'Gezegen raporu', subtitle: 'Son 24 saatte Oculix kaynaklarından alınan olaylar', coverage: 'Kapsam', generated: 'Oluşturuldu', events: 'Olaylar', locations: 'Konumlar', sources: 'Kaynaklar', empty: 'Yüklenen verilerde zaman damgalı olay yok', all: 'Tümü', exportMd: 'Markdown dışa aktar', exportJson: 'JSON dışa aktar', refresh: 'Raporu yenile', locate: 'Merkezle', source: 'Kaynak', age: 'Yaş', confidence: 'Güven', updated: 'Son oluşturma', disclaimer: 'Bu rapor yalnızca yüklenen kaynaklardan alınan verileri özetler; dünyadaki tüm olayları kapsadığını iddia etmez.' },
} as const;

const categoryLabels: Record<WorldReportCategory, Record<'ar' | 'en', string>> = {
  news: { ar: 'أخبار', en: 'News' }, earthquake: { ar: 'زلازل', en: 'Earthquakes' }, fire: { ar: 'حرائق', en: 'Fires' }, conflict: { ar: 'نزاعات وحوادث', en: 'Conflicts & incidents' }, cyber: { ar: 'سيبراني', en: 'Cyber' }, weather: { ar: 'طقس', en: 'Weather' }, other: { ar: 'أخرى', en: 'Other' },
};

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

export default function WorldReportPanel({ data, dataVersion = 0, language, onClose, onLocate }: Props) {
  const t = copy[language];
  const [filter, setFilter] = useState<'all' | WorldReportCategory>('all');
  const report = useMemo(() => buildWorldReport(data), [data, dataVersion]);
  const filtered = filter === 'all' ? report.events : report.events.filter(event => event.category === filter);
  const locale = language === 'ar' ? 'ar' : language;
  const sourceCount = new Set(report.events.map(event => event.source)).size;
  const categoryOptions = (Object.keys(report.byCategory) as WorldReportCategory[]).filter(category => report.byCategory[category] > 0);
  return (
    <div className="oculix-world-report-backdrop" role="dialog" aria-modal="true" dir={language === 'ar' ? 'rtl' : 'ltr'} onClick={onClose}>
      <section className="oculix-world-report" onClick={event => event.stopPropagation()}>
        <header className="oculix-world-report-head"><div><span className="oculix-settings-eyebrow"><FileText size={14} /> OX / 24H INTELLIGENCE</span><h2>{t.title}</h2><p>{t.subtitle}</p></div><button type="button" onClick={onClose} aria-label={language === 'ar' ? 'إغلاق التقرير' : 'Close report'}><X size={18} /></button></header>
        <div className="oculix-report-disclaimer">{t.disclaimer}</div>
        <div className="oculix-report-meta"><span><strong>{report.events.length}</strong>{t.events}</span><span><strong>{report.byLocation.length}</strong>{t.locations}</span><span><strong>{sourceCount}</strong>{t.sources}</span><span><strong>{new Date(report.generatedAt).toLocaleTimeString(locale)}</strong>{t.generated}</span></div>
        <div className="oculix-report-actions"><button type="button" onClick={() => download('oculix-planet-report-24h.md', worldReportMarkdown(report), 'text/markdown;charset=utf-8')}><Download size={14} />{t.exportMd}</button><button type="button" onClick={() => download('oculix-planet-report-24h.json', JSON.stringify(report, null, 2), 'application/json;charset=utf-8')}><Download size={14} />{t.exportJson}</button><button type="button" onClick={() => window.location.reload()}><RefreshCw size={14} />{t.refresh}</button></div>
        <div className="oculix-report-filters"><button type="button" className={filter === 'all' ? 'is-selected' : ''} onClick={() => setFilter('all')}>{t.all}</button>{categoryOptions.map(category => <button type="button" key={category} className={filter === category ? 'is-selected' : ''} onClick={() => setFilter(category)}>{categoryLabels[category][language === 'ar' ? 'ar' : 'en']} <b>{report.byCategory[category]}</b></button>)}</div>
        <div className="oculix-report-coverage"><span>{t.coverage}</span><code dir="ltr">{new Date(report.windowStart).toISOString()} → {new Date(report.windowEnd).toISOString()}</code></div>
        <div className="oculix-report-list">{filtered.length === 0 ? <p className="oculix-report-empty">{t.empty}</p> : filtered.slice(0, 120).map(event => <article className="oculix-report-event" key={event.id}><div className="oculix-report-event-main"><div className="oculix-report-event-title"><span className={`freshness-badge freshness-${event.freshness.toLowerCase()}`}>{language === 'ar' ? freshnessLabel(event.freshness, 'ar') : event.freshness}</span><strong>{event.title}</strong></div><div className="oculix-report-event-location"><MapPin size={13} />{event.location}{event.lat !== undefined && event.lng !== undefined ? <code dir="ltr">{event.lat.toFixed(3)}, {event.lng.toFixed(3)}</code> : null}</div><div className="oculix-report-event-meta"><span>{t.source}: <b>{event.source}</b></span><span>{t.age}: {formatAge(event.sourceAgeSeconds, language === 'ar' ? 'ar' : 'en')}</span><span>{t.confidence}: {event.confidence === null ? '—' : `${Math.round(event.confidence * 100)}%`}</span><time dir="ltr">{new Date(event.timestamp).toLocaleString(locale)}</time></div></div><div className="oculix-report-event-actions">{event.lat !== undefined && event.lng !== undefined && <button type="button" onClick={() => onLocate?.(event.lat!, event.lng!)} aria-label={t.locate}><MapPin size={14} />{t.locate}</button>}{event.url && <a href={event.url} target="_blank" rel="noreferrer">↗</a>}</div></article>)}</div>
        <footer className="oculix-report-footer">{t.updated}: <time dir="ltr">{new Date(report.generatedAt).toLocaleString(locale)}</time></footer>
      </section>
    </div>
  );
}
