import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res })
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { public_token, institution_id, institution_name } = req.body
    
    if (!public_token || !institution_id) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }
    
    // Call your server API to exchange public token
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange_public_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        public_token,
        institution_id,
        institution_name
      })
    })
    
    const data = await apiRes.json()
    
    if (!apiRes.ok) {
      throw new Error(data.error || 'Failed to exchange token')
    }
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error exchanging token:', error.message)
    return res.status(500).json({ error: error.message })
  }
} 