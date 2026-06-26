import { cn } from '@/lib/utils'

/**
 * Simple controlled tabs.
 * tabs = [{ value, label }]; `value` + `onChange` control the active tab.
 */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1',
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
              active
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
