import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

// Gives `next dev` the same Cloudflare bindings the deployed Worker gets — the
// R2 cache bucket and the cache Durable Objects — backed by local Miniflare
// state. Without it, anything reading getCloudflareContext() only works in
// `npm run preview`, which rebuilds on every change.
initOpenNextCloudflareForDev();

export default nextConfig;
