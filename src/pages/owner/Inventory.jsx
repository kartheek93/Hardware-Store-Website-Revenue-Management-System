import { useState } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useProducts } from '@/hooks/useProducts'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { PageHeader } from '@/components/owner/PageHeader'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { StockBadge, ActiveBadge } from '@/components/shared/StatusBadge'
import { ProductForm } from '@/components/owner/ProductForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export default function Inventory() {
  const { products, loading, refetch } = useProducts({ activeOnly: false })
  const { success, error: toastError } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(product) {
    setEditing(product)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      // Soft delete — keep the row so bill history stays intact.
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', deleting.id)
      if (error) throw error
      success('Product removed from catalogue')
      setDeleting(null)
      refetch()
    } catch (err) {
      console.error('Delete failed:', err)
      toastError('Failed to remove product.')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {p.image_url ? (
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary/40">
                {p.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{p.name}</p>
            {p.description && (
              <p className="truncate text-xs text-muted-foreground">{p.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (p) => <Badge variant="neutral">{p.category}</Badge>,
    },
    {
      key: 'selling_price',
      header: 'Price',
      sortable: true,
      className: 'text-right',
      render: (p) => (
        <span className="font-semibold tabular-nums">{formatCurrency(p.selling_price)}</span>
      ),
    },
    {
      key: 'stock_qty',
      header: 'Stock',
      sortable: true,
      render: (p) => <StockBadge stock={p.stock_qty} reorderLevel={p.reorder_level} />,
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (p) => <ActiveBadge active={p.is_active} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          {p.is_active && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleting(p)}
              aria-label="Remove"
              className="text-danger hover:bg-danger-bg hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Manage your products, prices and stock levels.">
        <Button onClick={openAdd}>
          <Plus className="h-4.5 w-4.5" /> Add Product
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchKeys={['name', 'category', 'description']}
        searchPlaceholder="Search products…"
        emptyIcon={Package}
        emptyTitle="No products yet"
        emptyDescription="Add your first product to start building the catalogue."
        emptyAction={
          <Button onClick={openAdd}>
            <Plus className="h-4.5 w-4.5" /> Add Product
          </Button>
        }
      />

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remove this product?"
        description={
          deleting
            ? `“${deleting.name}” will be hidden from the public catalogue. Existing bills keep their record. You can re-activate it later by editing it.`
            : ''
        }
        confirmLabel="Remove product"
      />
    </div>
  )
}
