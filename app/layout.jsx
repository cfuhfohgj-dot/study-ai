import './globals.css';
export const metadata = { title: 'مذاكرة ذكية | Smart Study', description: 'AI tutor with video explanations' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1730' };
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('study_theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('study_lang')||'ar';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'}catch(e){document.documentElement.classList.add('dark')}` }} />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 text-slate-900 antialiased dark:from-[#0b1730] dark:to-[#0a1226] dark:text-slate-100">{children}</body>
    </html>
  );
}
