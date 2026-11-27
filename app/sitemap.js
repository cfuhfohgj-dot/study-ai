export default function sitemap() {
  const base = 'https://study-ai-seven-beta.vercel.app';
  return [
    { url: base + '/', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ];
}
