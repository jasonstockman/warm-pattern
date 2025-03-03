import path from 'path'

// Handle both Windows and Unix paths
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Helper function for consistent URL joining
export function joinUrl(...parts: string[]): string {
  return parts.map(part => part.replace(/^\/|\/$/g, '')).join('/')
} 