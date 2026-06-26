import { useMemo, useState } from 'react'
import { ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

/**
 * Reusable data table for the owner dashboard.
 *
 * columns: [{
 *   key,                       // unique id
 *   header,                    // column label
 *   accessor?: (row) => value, // value for sorting/searching (defaults row[key])
 *   render?: (row) => node,    // cell content (defaults to accessor value)
 *   sortable?: boolean,
 *   className?,                // td/th extra classes (e.g. text-right)
 *   headerClassName?,
 * }]
 */
export function DataTable({
  columns,
  data,
  loading = false,
  searchKeys,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyIcon,
  emptyAction,
  onRowClick,
  getRowId = (row) => row.id,
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [page, setPage] = useState(1)

  const accessorFor = (col) =>
    col.accessor || ((row) => row[col.key])

  // --- Search ---
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    const keys = searchKeys || columns.map((c) => c.key)
    return data.filter((row) =>
      keys.some((k) => {
        const col = columns.find((c) => c.key === k)
        const val = col ? accessorFor(col)(row) : row[k]
        return String(val ?? '').toLowerCase().includes(q)
      })
    )
  }, [data, query, searchKeys, columns])

  // --- Sort ---
  const sorted = useMemo(() => {
    if (!sort.key) return searched
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return searched
    const get = accessorFor(col)
    const arr = [...searched].sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return av - bv
      return String(av).localeCompare(String(bv), undefined, { numeric: true })
    })
    return sort.dir === 'desc' ? arr.reverse() : arr
  }, [searched, sort, columns])

  // --- Paginate ---
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  function toggleSort(col) {
    if (!col.sortable) return
    setSort((s) =>
      s.key === col.key
        ? { key: col.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: 'asc' }
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                      col.headerClassName,
                      col.className
                    )}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        {col.header}
                        {sort.key === col.key ? (
                          sort.dir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {!loading && pageRows.length > 0 && (
              <tbody className="divide-y divide-border">
                {pageRows.map((row) => (
                  <tr
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'transition-colors hover:bg-muted/40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('px-4 py-3 align-middle text-foreground', col.className)}
                      >
                        {col.render ? col.render(row) : String(accessorFor(col)(row) ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {loading && <TableSkeleton rows={pageSize > 6 ? 6 : pageSize} cols={columns.length} />}

        {!loading && sorted.length === 0 && (
          <EmptyState
            icon={emptyIcon}
            title={query ? 'No results' : emptyTitle}
            description={query ? `Nothing matches “${query}”.` : emptyDescription}
            action={!query ? emptyAction : undefined}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && sorted.length > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="px-2 font-medium text-foreground">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
