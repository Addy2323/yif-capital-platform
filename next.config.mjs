/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Do not bundle node-cron (uses Node built-ins: path, child_process, etc.)
  serverExternalPackages: ["node-cron"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Node.js built-ins used by node-cron are not bundled (fixes "Can't resolve 'path'")
      const nodeBuiltins = ["path", "fs", "child_process", "events", "util", "os"];
      config.externals = config.externals || [];
      config.externals.push(({ request }, callback) => {
        if (nodeBuiltins.includes(request)) {
          return callback(null, "commonjs " + request);
        }
        callback();
      });
    }
    return config;
  },
}

export default nextConfig
