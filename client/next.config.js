/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkcapjvaqvlqhurnxyka.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2FwanZhcXZscWh1cm54eWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzU2ODksImV4cCI6MjA0OTk1MTY4OX0.dFqVBrkHbcwMpJVs41F4Ttc2STH-aveqy0EopYAmIfY',
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
  },
  
  async rewrites() {
    return [
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:3001/users/:path*',
      },
      {
        source: '/api/items/:path*',
        destination: 'http://localhost:3001/items/:path*',
      },
      {
        source: '/api/accounts/:path*',
        destination: 'http://localhost:3001/accounts/:path*',
      },
      {
        source: '/api/institutions/:path*',
        destination: 'http://localhost:3001/institutions/:path*',
      },
      {
        source: '/api/transactions/:path*', 
        destination: 'http://localhost:3001/transactions/:path*',
      },
      {
        source: '/api/services/:path*',
        destination: 'http://localhost:3001/services/:path*',
      },
      {
        source: '/api/sessions/:path*',
        destination: 'http://localhost:3001/sessions/:path*',
      },
      {
        source: '/api/assets/:path*',
        destination: 'http://localhost:3001/assets/:path*',
      },
      // Keep these for backward compatibility
      {
        source: '/users/:path*',
        destination: 'http://localhost:3001/users/:path*',
      },
      {
        source: '/items/:path*',
        destination: 'http://localhost:3001/items/:path*',
      },
      {
        source: '/accounts/:path*',
        destination: 'http://localhost:3001/accounts/:path*',
      },
      {
        source: '/institutions/:path*',
        destination: 'http://localhost:3001/institutions/:path*',
      },
      {
        source: '/transactions/:path*', 
        destination: 'http://localhost:3001/transactions/:path*',
      },
      {
        source: '/services/:path*',
        destination: 'http://localhost:3001/services/:path*',
      },
      {
        source: '/sessions/:path*',
        destination: 'http://localhost:3001/sessions/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'http://localhost:3001/assets/:path*',
      }
    ]
  }
}

module.exports = nextConfig 