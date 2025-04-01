// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              script-src 'self' https://apis.google.com https://www.gstatic.com 
              https://accounts.google.com 'unsafe-inline' 'unsafe-eval';
              connect-src 'self' https://*.googleapis.com https://accounts.google.com;
              frame-src https://accounts.google.com;
            `.replace(/\n/g, ' '),
          }
        ]
      }
    ]
  }
}
