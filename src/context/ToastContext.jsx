import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
})

let idCounter = 0

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-success',
    iconColor: 'text-success',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-danger',
    iconColor: 'text-danger',
  },
  info: {
    icon: Info,
    bar: 'bg-secondary',
    iconColor: 'text-secondary',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, { variant = 'info', duration = 3000 } = {}) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, variant }])
      if (duration > 0) {
        setTimeout(() => remove(id), duration)
      }
      return id
    },
    [remove]
  )

  const api = {
    toast,
    success: (msg, opts) => toast(msg, { ...opts, variant: 'success' }),
    error: (msg, opts) => toast(msg, { ...opts, variant: 'error' }),
    info: (msg, opts) => toast(msg, { ...opts, variant: 'info' }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast viewport — bottom-right, above everything */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info
          const Icon = v.icon
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex animate-fade-in items-start gap-3 overflow-hidden rounded-lg border border-border bg-card p-3.5 pr-2.5 shadow-lg"
            >
              <span className={cn('mt-0.5 h-2 w-2 shrink-0 self-stretch rounded-full', v.bar)} aria-hidden />
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', v.iconColor)} aria-hidden />
              <p className="flex-1 pt-0.5 text-sm font-medium text-foreground">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}
