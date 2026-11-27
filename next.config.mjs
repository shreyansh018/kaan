/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone so the Docker image runs with `node server.js`
  // and does not need node_modules or a build toolchain at runtime.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
