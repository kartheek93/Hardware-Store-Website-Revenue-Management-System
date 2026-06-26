import { cn } from '@/lib/utils'

const VARIANTS = {
  neutral: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-bg text-success border-success-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  danger: 'bg-danger-bg text-danger border-danger-border',
  outline: 'bg-transparent text-muted-foreground border-border',
}

export function Badge({ className, variant = 'neutral', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
