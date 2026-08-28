export type OculixLanguage = 'ar' | 'en' | 'es' | 'fr' | 'de' | 'tr';
export type LegacyLanguage = 'ar' | 'en';

export const LANGUAGE_OPTIONS: Array<{ id: OculixLanguage; native: string; english: string; dir: 'rtl' | 'ltr' }> = [
  { id: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl' },
  { id: 'en', native: 'English', english: 'English', dir: 'ltr' },
  { id: 'es', native: 'Español', english: 'Spanish', dir: 'ltr' },
  { id: 'fr', native: 'Français', english: 'French', dir: 'ltr' },
  { id: 'de', native: 'Deutsch', english: 'German', dir: 'ltr' },
  { id: 'tr', native: 'Türkçe', english: 'Turkish', dir: 'ltr' },
];

export function legacyLanguage(language: OculixLanguage): LegacyLanguage {
  return language === 'ar' ? 'ar' : 'en';
}

export type OculixBackground = 'void' | 'aurora' | 'topography' | 'radar' | 'solar' | 'ocean';

export type LocalizedName = Record<OculixLanguage, string>;

export const BACKGROUND_OPTIONS: Array<{ id: OculixBackground; ar: string; en: string; es: string; fr: string; de: string; tr: string }> = [
  { id: 'void', ar: 'الفراغ العميق', en: 'Deep void', es: 'Vacío profundo', fr: 'Vide profond', de: 'Tiefer Raum', tr: 'Derin boşluk' },
  { id: 'aurora', ar: 'الشفق القطبي', en: 'Aurora field', es: 'Campo aurora', fr: 'Champ auroral', de: 'Polarlichtfeld', tr: 'Kutup ışığı alanı' },
  { id: 'topography', ar: 'التضاريس', en: 'Topographic lines', es: 'Líneas topográficas', fr: 'Lignes topographiques', de: 'Topografische Linien', tr: 'Topografik çizgiler' },
  { id: 'radar', ar: 'رادار المسح', en: 'Radar sweep', es: 'Barrido de radar', fr: 'Balayage radar', de: 'Radarscan', tr: 'Radar taraması' },
  { id: 'solar', ar: 'العاصفة الشمسية', en: 'Solar storm', es: 'Tormenta solar', fr: 'Tempête solaire', de: 'Sonnensturm', tr: 'Güneş fırtınası' },
  { id: 'ocean', ar: 'المحيط الليلي', en: 'Night ocean', es: 'Océano nocturno', fr: 'Océan nocturne', de: 'Nachtmeer', tr: 'Gece okyanusu' },
];
