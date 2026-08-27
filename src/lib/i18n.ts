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

export const BACKGROUND_OPTIONS: Array<{ id: OculixBackground; ar: string; en: string }> = [
  { id: 'void', ar: 'الفراغ العميق', en: 'Deep void' },
  { id: 'aurora', ar: 'الشفق القطبي', en: 'Aurora field' },
  { id: 'topography', ar: 'التضاريس', en: 'Topographic lines' },
  { id: 'radar', ar: 'رادار المسح', en: 'Radar sweep' },
  { id: 'solar', ar: 'العاصفة الشمسية', en: 'Solar storm' },
  { id: 'ocean', ar: 'المحيط الليلي', en: 'Night ocean' },
];
