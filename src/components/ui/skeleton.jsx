import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-secondary-100', className)}
      {...props}
    />
  )
}

/** A skeleton shaped like a table — rows × cols of shimmer bars. */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn('h-4 flex-1', c === 0 && 'max-w-[40px]', c === cols - 1 && 'max-w-[80px]')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
