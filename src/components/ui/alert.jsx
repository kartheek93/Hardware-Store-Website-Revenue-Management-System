import { Link } from 'react-router-dom'
import { AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  warning: { box: 'bg-warning-bg border-warning-border', icon: 'text-warning', Icon: AlertTriangle },
  danger: { box: 'bg-danger-bg border-danger-border', icon: 'text-danger', Icon: AlertTriangle },
  success: { box: 'bg-success-bg border-success-border', icon: 'text-success', Icon: CheckCircle2 },
  info: { box: 'bg-primary-50 border-primary-200', icon: 'text-primary', Icon: Info },
}

/** Inline, persistent alert with an optional link action. */
export function Alert({ variant = 'info', title, children, linkTo, linkLabel, className }) {
  const v = VARIANTS[variant] || VARIANTS.info
  const Icon = v.Icon
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        v.box,
        className
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', v.icon)} />
      <div className="flex-1">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        {children && <p className="text-secondary-700">{children}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex shrink-0 items-center gap-1 self-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-card/60"
        >
          {linkLabel || 'View'} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
