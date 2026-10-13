/** @type {import('next').NextConfig} */
const isWindowsLocalBuild = process.platform === 'win32' && !process.env.VERCEL;

const nextConfig = {
  // Normal Next.js server app (SSR/ISR on Vercel): room data edited in the
  // admin is rendered into the HTML and revalidated on demand.
  // 301 redirects live in vercel.json (single source of truth).

  // Lets a production build run next to `next dev` without clobbering its
  // .next folder (e.g. NEXT_DIST_DIR=.next-build npm run build).
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Output file tracing is required on Vercel (serverless bundles). It is only
  // disabled for local Windows builds to dodge a @vercel/nft bug where it calls
  // fs.readlink on ordinary files and gets EISDIR instead of EINVAL.
  ...(isWindowsLocalBuild ? { outputFileTracing: false } : {}),

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Kept unoptimized on purpose: Vercel's image optimization is metered and
    // every site image is already a pre-sized WebP (room photos uploaded from
    // the admin are resized to <= 2400px WebP in the browser).
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**.firebasestorage.app' },
      // Firebase Storage emulator (local development only).
      { protocol: 'http', hostname: '127.0.0.1', port: '9199' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
  },
  webpack: (config) => {
    // Works around "EISDIR: illegal operation on a directory, readlink"
    // seen on Windows when webpack's module resolver follows symlinks.
    config.resolve.symlinks = false;
    return config;
  },
};

module.exports = nextConfig;
