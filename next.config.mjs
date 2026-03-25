import withPWAInit from "@ducanh2912/next-pwa"

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
      const nodeBuiltins = ["path", "fs", "child_process", "events", "util", "os"]
      config.externals = config.externals || []
      config.externals.push(({ request }, callback) => {
        if (nodeBuiltins.includes(request)) {
          return callback(null, "commonjs " + request)
        }
        callback()
      })
    }
    return config
  },
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/_next\/data\//],
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/api"),
        handler: "NetworkOnly",
      },
    ],
  },
})

export default withPWA(nextConfig)
