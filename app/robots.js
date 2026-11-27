export default function robots() {
  const base = 'https://study-ai-seven-beta.vercel.app';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: base + '/sitemap.xml',
    host: base,
  };
}
