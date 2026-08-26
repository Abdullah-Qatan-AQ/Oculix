'use client';

import { ArrowLeft, ArrowRight, Home, Layers3, Settings2 } from 'lucide-react';

export default function MapModeDock({ language, onHome, onLayers, onSettings }: { language: 'ar' | 'en'; onHome: () => void; onLayers: () => void; onSettings: () => void }) {
  const ar = language === 'ar';
  return (
    <div className="map-mode-dock" dir={ar ? 'rtl' : 'ltr'}>
      <button type="button" className="map-mode-brand" onClick={onHome}><span className="map-mode-ox"><img src="/oculix-icon.svg" alt="OX" /></span><span>Oculix</span></button>
      <div className="map-mode-divider" />
      <span className="map-mode-label">{ar ? 'وضع الخريطة' : 'MAP MODE'}</span>
      <div className="map-mode-actions">
        <button type="button" onClick={onLayers} aria-label={ar ? 'فتح الطبقات' : 'Open layers'} title={ar ? 'فتح الطبقات' : 'Open layers'}><Layers3 size={15} /></button>
        <button type="button" onClick={onSettings} aria-label={ar ? 'الإعدادات' : 'Settings'} title={ar ? 'الإعدادات' : 'Settings'}><Settings2 size={15} /></button>
        <button type="button" onClick={onHome} aria-label={ar ? 'العودة للرئيسية' : 'Back home'} title={ar ? 'العودة للرئيسية' : 'Back home'}>{ar ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}<Home size={13} /></button>
      </div>
    </div>
  );
}
