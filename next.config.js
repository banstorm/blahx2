module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
      config.resolve.fallback.tls = false
      config.resolve.fallback.net = false
      config.resolve.fallback.child_process = false
    }

    return config
  },
  future: {
    webpack5: true,
  },
  fallback: {
    fs: false,
    tls: false,
    net: false,
    child_process: false
  },
  publicRuntimeConfig:{
    apiKey : process.env.publicApiKey || '',
    authDomain :  process.env.FIREBASE_AUTH_HOST || '',
    projectId :  process.env.projectId || '',
  },
  
}
