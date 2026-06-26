import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/owner/Sidebar'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Alert } from '@/components/ui/alert'

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {!isSupabaseConfigured && (
            <Alert
              variant="warning"
              className="mb-6"
              title="Supabase not connected"
            >
              Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to
              the <code>.env</code> file and restart the dev server to load live data.
            </Alert>
          )}
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
