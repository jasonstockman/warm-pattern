import { useCallback, useState, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { supabase } from '../lib/supabaseClient'

interface PlaidLinkProps {
  onSuccess: () => void
  onExit?: () => void
}

export default function PlaidLinkButton({ onSuccess, onExit }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const getPlaidLinkToken = async () => {
      try {
        setIsLoading(true)
        
        // Get link token from your API server
        const response = await fetch('/api/create_link_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setLinkToken(data.link_token)
      } catch (error) {
        console.error('Failed to get link token:', error.message)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    getPlaidLinkToken()
  }, [])
  
  const exchangePublicToken = async (publicToken: string, metadata: any) => {
    try {
      // Exchange public token through your API
      const response = await fetch('/api/exchange_public_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          institution_id: metadata.institution.institution_id,
          institution_name: metadata.institution.name,
        }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      onSuccess()
    } catch (error) {
      console.error('Failed to exchange token:', error.message)
      setError(error.message)
    }
  }
  
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      exchangePublicToken(public_token, metadata)
    },
    onExit: () => {
      if (onExit) onExit()
    },
  })
  
  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
      
      <button
        onClick={() => open()}
        disabled={!ready || isLoading}
        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Connect Bank Account'}
      </button>
    </div>
  )
} 