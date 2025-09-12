import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tenantAPI } from '../services/api'

export default function UpgradePrompt() {
  const { user, upgradeTenant } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await tenantAPI.getStats()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleUpgrade = async () => {
    if (!confirm('Are you sure you want to upgrade to Pro plan? This will remove the note limit.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await upgradeTenant()
      if (result.success) {
        alert('Successfully upgraded to Pro plan!')
        window.location.reload()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Upgrade failed. Please try again.')
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show upgrade prompt for Pro users
  if (user?.tenant?.subscription === 'pro') {
    return null
  }

  // Don't show upgrade prompt for non-admin users
  if (user?.role !== 'admin') {
    return null
  }

  // Don't show if we haven't loaded stats yet
  if (!stats) {
    return null
  }

  // Only show if approaching or at the limit
  if (stats.canCreateMoreNotes && stats.totalNotes < stats.noteLimit - 1) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {stats.totalNotes >= stats.noteLimit ? 'Note Limit Reached!' : 'Approaching Note Limit'}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You have {stats.totalNotes} of {stats.noteLimit} notes on the Free plan.
              {stats.totalNotes >= stats.noteLimit && ' Upgrade to Pro for unlimited notes!'}
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Upgrading...' : 'Upgrade to Pro Plan'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
