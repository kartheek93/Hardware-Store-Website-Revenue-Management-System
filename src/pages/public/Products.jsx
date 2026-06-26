import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, PackageSearch, AlertCircle } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { PRODUCT_CATEGORIES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Alert } from '@/components/ui/alert'
import { ProductCard } from '@/components/public/ProductCard'
import { Stagger, StaggerItem } from '@/components/shared/Reveal'

const TABS = ['All', ...PRODUCT_CATEGORIES]

export default function Products() {
  const { products, loading, error } = useProducts({ activeOnly: true })
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')

  // Active category comes from the URL (?category=) so links + tabs stay in sync.
  const rawCategory = searchParams.get('category')
  const activeCategory = TABS.includes(rawCategory) ? rawCategory : 'All'

  const setCategory = (cat) => {
    const next = new URLSearchParams(searchParams)
    if (cat === 'All') next.delete('category')
    else next.set('category', cat)
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory
      const matchQuery = !q || p.name.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [products, activeCategory, query])

  return (
    <div className="bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-muted/40">
        <div className="container-site py-12 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Products
          </h1>
          <p className="mt-2 max-w-2xl text-base text-secondary-700">
            Browse our full range of paints, iron &amp; steel, hardware and tools.
            Prices update live as we restock.
          </p>
        </div>
      </div>

      <div className="container-site py-8 sm:py-10">
        {/* Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category tabs */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setCategory(tab)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  activeCategory === tab
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border bg-card text-secondary-700 hover:bg-muted'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name…"
              className="pl-9"
            />
          </div>
        </div>

        {/* Not-configured notice */}
        {error === 'not-configured' && (
          <Alert variant="warning" className="mt-6" title="Catalogue not connected yet">
            Connect Supabase (see README → “Connect Supabase”) to load live products.
          </Alert>
        )}
        {error && error !== 'not-configured' && (
          <Alert variant="danger" className="mt-6" title="Couldn’t load products">
            {error}
          </Alert>
        )}

        {/* Results */}
        <div className="mt-7">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                {activeCategory !== 'All' && ` in ${activeCategory}`}
              </p>
              <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.05}>
                {filtered.map((p) => (
                  <StaggerItem key={p.id} className="h-full">
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          ) : (
            <EmptyState
              icon={query ? PackageSearch : AlertCircle}
              title={query ? 'No matching products' : 'No products here yet'}
              description={
                query
                  ? `Nothing matches “${query}”${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.`
                  : `There are no products in ${activeCategory === 'All' ? 'the catalogue' : activeCategory} right now. Please check back soon.`
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
