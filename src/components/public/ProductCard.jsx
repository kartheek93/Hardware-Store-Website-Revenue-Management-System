import { Badge } from '@/components/ui/badge'
import { formatCurrency, cn } from '@/lib/utils'
import { Tilt } from '@/components/shared/Tilt'
import { categoryMeta, categoryGradient, productFallbackImage } from '@/lib/categories'

/** Public catalogue card. Falls back to a real category photo when no image. */
export function ProductCard({ product }) {
  const lowOrOut = product.stock_qty <= 0
  const meta = categoryMeta(product.category)
  const Icon = meta?.icon
  const fallback = productFallbackImage(product)

  return (
    <Tilt max={7} scale={1.02} glare className="h-full rounded-xl">
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br', categoryGradient(product.category))}>
            {fallback && (
              <img
                src={fallback}
                alt={product.category}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div className={cn('absolute inset-0 bg-gradient-to-t opacity-50 mix-blend-multiply', categoryGradient(product.category))} />
            {Icon && (
              <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-foreground shadow-sm backdrop-blur">
                <Icon className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
        <div className="absolute left-2.5 top-2.5">
          <Badge variant="primary">{product.category}</Badge>
        </div>
        {lowOrOut && (
          <div className="absolute right-2.5 top-2.5">
            <Badge variant="danger">Out of stock</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-3">
          <p className="text-lg font-extrabold tracking-tight text-foreground">
            {formatCurrency(product.selling_price)}
          </p>
        </div>
      </div>
    </article>
    </Tilt>
  )
}
