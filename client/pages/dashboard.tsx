import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadAccounts() {
      if (!user) return
      
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          
        if (error) throw error
        
        setAccounts(data || [])
      } catch (error) {
        console.error('Error loading accounts:', error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAccounts()
  }, [user])
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={signOut}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Sign Out
          </button>
        </header>
        
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Your Accounts</h2>
          
          {isLoading ? (
            <div className="text-gray-600">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
              You don't have any accounts yet. Connect a bank to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="text-lg font-medium">{account.name}</h3>
                  <p className="text-gray-500">**** {account.mask}</p>
                  <p className="mt-2 text-xl font-semibold">
                    ${parseFloat(account.current_balance).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 