import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Piezas hosting ships .next/standalone/server.js; this line makes the build produce it.
  output: 'standalone',
};

export default nextConfig;
