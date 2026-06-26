import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { isOwner } from '@/config/owners'

/**
 * Gate for all /owner/* routes.
 * - loading  → spinner
 * - no user  → redirect to /owner/login (remembering where they wanted to go)
 * - not owner → redirect to /owner/login with error
 * - signed in & authorized → render children
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />
  }

  if (!isOwner(user)) {
    return (
      <Navigate
        to="/owner/login"
        replace
        state={{
          from: location.pathname,
          error: 'Access Denied: You do not have owner privileges.'
        }}
      />
    )
  }

  return children
}

