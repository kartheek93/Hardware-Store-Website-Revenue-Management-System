import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const TONES = {
  primary: 'bg-primary-50 text-primary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  neutral: 'bg-secondary-100 text-secondary-600',
}

export function KpiCard({ label, value, icon: Icon, tone = 'primary', hint, loading, to }) {
  const body = (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200',
        to && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-28" />
        ) : (
          <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
        )}
        {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
        <Icon className="h-5.5 w-5.5" />
      </span>
    </div>
  )

  return to ? (
    <Link to={to} className="block">
      {body}
    </Link>
  ) : (
    body
  )
}
