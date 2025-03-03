import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import path from 'path'
import { API_URL, joinUrl } from '../../lib/env'

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
    // Call your server API to create link token
    const apiRes = await fetch(joinUrl(API_URL, 'api', 'create_link_token'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    const data = await apiRes.json()
    
    if (!apiRes.ok) {
      throw new Error(data.error || 'Failed to create link token')
    }
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error creating link token:', error.message)
    return res.status(500).json({ error: error.message })
  }
} 