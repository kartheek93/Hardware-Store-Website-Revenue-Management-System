import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import ProtectedRoute from '@/components/ProtectedRoute'

import PublicLayout from '@/layouts/PublicLayout'
import Home from '@/pages/public/Home'
import Products from '@/pages/public/Products'
import About from '@/pages/public/About'
import Contact from '@/pages/public/Contact'

// Owner area is lazy-loaded so the public site never ships jsPDF / Recharts.
const OwnerLayout = lazy(() => import('@/layouts/OwnerLayout'))
const Login = lazy(() => import('@/pages/owner/Login'))
const Dashboard = lazy(() => import('@/pages/owner/Dashboard'))
const Inventory = lazy(() => import('@/pages/owner/Inventory'))
const Customers = lazy(() => import('@/pages/owner/Customers'))
const Bills = lazy(() => import('@/pages/owner/Bills'))
const NewBill = lazy(() => import('@/pages/owner/NewBill'))
const Reports = lazy(() => import('@/pages/owner/Reports'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public website */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Owner login (no layout) */}
              <Route path="/owner/login" element={<Login />} />

              {/* Owner dashboard (protected) */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute>
                    <OwnerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/owner/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="customers" element={<Customers />} />
                <Route path="bills" element={<Bills />} />
                <Route path="bills/new" element={<NewBill />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Catch-all → home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
