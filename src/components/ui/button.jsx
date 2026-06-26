import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground shadow-xs hover:bg-primary-600 active:bg-primary-700',
  secondary:
    'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary-600 active:bg-secondary-700',
  outline:
    'border border-border bg-card text-foreground shadow-xs hover:bg-muted active:bg-secondary-100',
  ghost: 'text-foreground hover:bg-muted active:bg-secondary-100',
  danger:
    'bg-danger text-danger-foreground shadow-xs hover:brightness-95 active:brightness-90',
  whatsapp:
    'bg-[#25D366] text-white shadow-xs hover:bg-[#1faa54] active:bg-[#1b914a]',
  link: 'text-primary underline-offset-4 hover:underline px-0',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10',
}

const Button = forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    type = 'button',
    loading = false,
    disabled,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})

export { Button }
