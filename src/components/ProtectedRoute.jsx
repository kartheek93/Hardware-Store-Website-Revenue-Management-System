import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { checkIsOwner } from '@/config/owners'

/**
 * Gate for all /owner/* routes.
 * - loading / checking → spinner
 * - no user            → redirect to /owner/login
 * - not an owner       → redirect to /owner/login with an error
 * - signed in & owner  → render children
 *
 * Owner status is checked against the Supabase `app_owners` table (with the
 * hardcoded bootstrap owner as a fallback), so the check is async.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [authorized, setAuthorized] = useState(null) // null = still checking

  useEffect(() => {
    if (loading) return
    if (!user) {
      setAuthorized(false)
      return
    }
    let active = true
    setAuthorized(null)
    checkIsOwner(user).then((ok) => {
      if (active) setAuthorized(ok)
    })
    return () => {
      active = false
    }
  }, [user, loading])

  // Still resolving auth or owner status
  if (loading || (user && authorized === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />
  }

  if (!authorized) {
    return (
      <Navigate
        to="/owner/login"
        replace
        state={{
          from: location.pathname,
          error: 'Access Denied: You do not have owner privileges.',
        }}
      />
    )
  }

  return children
}
