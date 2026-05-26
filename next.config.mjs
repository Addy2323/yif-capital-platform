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
  // Serve runtime-uploaded files through the dynamic API route
  // so that /uploads/... URLs stored in the DB work in production
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/files/:path*",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; frame-src 'self' https:; connect-src 'self' https:;",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ]
  },
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
