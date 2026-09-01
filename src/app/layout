import type { Metadata, Viewport } from "next";
import ErrorBoundary from '@/components/ErrorBoundary';
import "./globals.css";

const SITE_URL = "https://oculixai.live";
const SITE_NAME = "Oculix";
const SITE_TITLE = "Oculix — منصة الاستخبارات المفتوحة والمراقبة العالمية";
const SITE_DESCRIPTION = "Oculix هي منصة عربية أولاً للاستخبارات المفتوحة والمراقبة العالمية. استكشف الطائرات والسفن والأقمار الصناعية والزلازل والحرائق والأخبار والأمن السيبراني في خريطة تفاعلية، مع مصدر كل معلومة ووقت تحديثها وعمرها ودرجة الثقة.";

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Oculix",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // SEO عربي — السوق الأساسي
    "منصة استخبارات مفتوحة", "أدوات OSINT", "مراقبة الأحداث العالمية", "خريطة العالم التفاعلية", "تتبع الطائرات", "تتبع السفن", "تتبع الأقمار الصناعية", "مراقبة الزلازل", "مراقبة الحرائق", "الأمن السيبراني", "تحليل المصادر", "تقرير آخر 24 ساعة", "خريطة استخبارات عالمية", "البحث الموحد", "وضع المحلل", "تحليل الكيانات", "مصادر البيانات", "درجة الثقة", "حداثة البيانات",
    // OSINT Tools - Primary focus
    "OSINT tools", "free OSINT tools", "online OSINT toolkit", "OSINT framework",
    "nmap online", "nmap scanner online", "free nmap scan", "port scanner online",
    "DNS lookup tool", "WHOIS lookup", "reverse DNS", "DNS records",
    "SSL certificate checker", "certificate transparency", "cert lookup",
    "BGP routing lookup", "ASN lookup", "IP geolocation",
    "threat intelligence", "threat intel lookup", "IP reputation check",
    "network reconnaissance", "recon tools", "penetration testing tools",
    "cybersecurity tools", "infosec tools", "security scanner",
    "linux OSINT tools", "kali linux tools online", "OSINT browser tools",
    
    // Intelligence Platform
    "OSINT", "open source intelligence", "intelligence platform", "global intelligence",
    "geospatial intelligence", "GEOINT", "SIGINT", "real-time tracking",
    "palantir alternative", "open source palantir", "intelligence dashboard",
    
    // Tracking & Data
    "flight tracker", "aircraft tracking", "ADS-B tracker", "live flight radar",
    "satellite tracking", "ISS tracker", "space station tracker",
    "CCTV cameras live", "security cameras worldwide", "live cameras",
    "earthquake monitor", "seismic activity", "USGS earthquake",
    "wildfire tracker", "NASA FIRMS", "active fires",
    "nuclear facilities map", "nuclear power plants",
    "severe weather alerts", "weather radar",
    "cyber threats dashboard", "CVE tracker",
    "space weather", "solar storm", "GPS jamming",
    "defense stocks", "commodities tracker",
    
    // Brand
    "oculix", "oculixai", "oculixai.live",
  ],
  authors: [{ name: "Oculix Project", url: SITE_URL }],
  creator: "Oculix Project",
  publisher: "Oculix Project",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
    languages: {
      ar: SITE_URL,
      en: `${SITE_URL}/en`,
      es: `${SITE_URL}/es`,
      fr: `${SITE_URL}/fr`,
      de: `${SITE_URL}/de`,
      tr: `${SITE_URL}/tr`,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: "Oculix — منصة الاستخبارات المفتوحة والمراقبة العالمية",
    description: "راقب الأحداث العالمية وحلّل مصادرها عبر خريطة تفاعلية للطيران والملاحة والأخبار والزلازل والحرائق والأمن السيبراني.",
    type: "website",
    siteName: SITE_NAME,
    locale: "ar_SA",
    alternateLocale: ["en_US", "es_ES", "fr_FR", "de_DE", "tr_TR"],
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Oculix — Live Intelligence Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oculix — استخبارات عالمية في خريطة واحدة",
    description: "منصة عربية أولاً لمراقبة العالم وتحليل المصادر والأحداث والكيانات مع مؤشرات واضحة لحداثة البيانات والثقة.",
    creator: "@Abdullah-Qatan",
    site: "@Abdullah-Qatan",
    images: [`${SITE_URL}/og-image.png`],
  },
  category: "technology",
  classification: "Intelligence & Security",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Oculix",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#06060C",
    "msapplication-config": "none",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Oculix — منصة الاستخبارات المفتوحة والمراقبة العالمية", 
  alternateName: ["OculixAI", "Oculix OSINT"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: ["ar", "en", "es", "fr", "de", "tr"],
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Arabic-first global OSINT dashboard",
    "Source provenance, freshness, confidence and LIVE/DELAYED/STALE status",
    "24-hour planet report from loaded documented sources",
    "Analyst Mode with timeline, snapshots, notes and evidence",
    "Entity Graph for visual relationship exploration",
    "Nmap port scanning from the browser — no install required",
    "DNS record lookup (A, AAAA, MX, NS, TXT, CNAME)",
    "WHOIS domain registration lookup",
    "SSL/TLS certificate transparency search",
    "BGP routing & ASN lookup",
    "IP geolocation & threat intelligence",
    "Real-time flight tracking (10,000+ aircraft via ADS-B)",
    "Satellite tracking (2,000+ objects including ISS)",
    "Worldwide CCTV camera monitoring (1,400+ feeds)",
    "Earthquake monitoring (USGS live feed)",
    "Wildfire detection (NASA FIRMS satellite data)",
    "Nuclear facility mapping (worldwide)",
    "Severe weather alerts & tracking",
    "Cyber threat & CVE intelligence",
    "Space weather & solar storm monitoring",
    "GPS jamming detection",
    "Defense & commodity market tracking",
    "SIGINT news aggregation feed",
    "Interactive 3D globe with day/night cycle",
    "Region intelligence dossier reports",
  ],
  screenshot: `${SITE_URL}/og-image.png`,
  author: {
    "@type": "Organization",
    name: "Oculix Project",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href={SITE_URL} />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

      </head>
      <body className="antialiased">
        <ErrorBoundary name="OCULIX Core">
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
