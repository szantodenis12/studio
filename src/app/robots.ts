import type { MetadataRoute } from 'next';

// Generates https://www.hotel-maxim.ro/robots.txt (currently 404).
// We don't block any AI crawler (GPTBot, PerplexityBot, Google-Extended,
// ClaudeBot): visibility in AI engines is the main goal of this SEO pass.
// Fully static: nothing here depends on data.

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/login', '/signup'] },
    ],
    sitemap: 'https://www.hotel-maxim.ro/sitemap.xml',
  };
}
