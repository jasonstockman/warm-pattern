import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { hash } = window.location
    if (hash) {
      supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN') {
          // Redirect to dashboard after sign in
          router.push('/dashboard')
        }
      })
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-xl font-semibold">Completing authentication...</h1>
          <p className="mt-2 text-gray-600">Please wait while we log you in.</p>
        </div>
      </div>
    </div>
  )
} 