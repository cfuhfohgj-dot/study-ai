import './globals.css';

const siteUrl = 'https://study-ai-seven-beta.vercel.app';
const siteName = 'Study AI';
const description = 'Study AI (مذاكرة ذكية): ارفع صورة من كتابك أو اكتب الجزء اللي مش فاهمه، ويطلع لك درس بالعربي بفيديو ونقاط وأمثلة وأسئلة وشات مع المعلم. Study AI turns a textbook page or a question into an Arabic video lesson with key points, worked examples and a quiz.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Study AI | مذاكرة ذكية بالذكاء الاصطناعي',
    template: '%s | Study AI',
  },
  description,
  applicationName: siteName,
  keywords: ['Study AI', 'study ai', 'مذاكرة ذكية', 'AI tutor', 'AI study app', 'مساعد مذاكرة', 'شرح بالذكاء الاصطناعي', 'درس بالفيديو', 'أسئلة واختبارات'],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: { google: 'RJcxyNc3q3YOPos0z02obWm7drN1kQqx5PxUir8wCgA' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: 'Study AI | مذاكرة ذكية بالذكاء الاصطناعي',
    description,
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study AI | مذاكرة ذكية',
    description,
  },
  category: 'education',
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1730' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteName,
  alternateName: ['Study AI', 'مذاكرة ذكية'],
  url: siteUrl,
  description,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  inLanguage: ['ar', 'en'],
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('study_theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('study_lang')||'ar';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'}catch(e){document.documentElement.classList.add('dark')}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 text-slate-900 antialiased dark:from-[#0b1730] dark:to-[#0a1226] dark:text-slate-100">{children}</body>
    </html>
  );
}
