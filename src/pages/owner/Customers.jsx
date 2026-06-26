import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Phone } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { PageHeader } from '@/components/owner/PageHeader'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { CustomerForm } from '@/components/owner/CustomerForm'
import { CustomerHistory } from '@/components/owner/CustomerHistory'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export default function Customers() {
  const { success, error: toastError } = useToast()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [history, setHistory] = useState(null)

  const fetchCustomers = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // Pull customers + a count of their bills in one query.
      const { data, error } = await supabase
        .from('customers')
        .select('*, bills(count)')
        .order('created_at', { ascending: false })
      if (error) throw error
      const mapped = (data || []).map((c) => ({
        ...c,
        bill_count: c.bills?.[0]?.count ?? 0,
      }))
      setCustomers(mapped)
    } catch (err) {
      console.error('Load customers failed:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  async function confirmDelete() {
    if (!deleting) return
    try {
      const { error } = await supabase.from('customers').delete().eq('id', deleting.id)
      if (error) throw error
      success('Customer deleted')
      setDeleting(null)
      fetchCustomers()
    } catch (err) {
      console.error('Delete customer failed:', err)
      toastError('Failed to delete. They may have existing bills.')
      setDeleting(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (c) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setHistory(c)
          }}
          className="text-left font-medium text-foreground hover:text-primary hover:underline"
        >
          {c.name}
        </button>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (c) => (
        <a
          href={`tel:${c.phone}`}
          className="inline-flex items-center gap-1.5 text-secondary-700 hover:text-primary"
        >
          <Phone className="h-3.5 w-3.5" /> {c.phone}
        </a>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (c) => (
        <span className="line-clamp-1 max-w-[220px] text-muted-foreground">
          {c.address || '—'}
        </span>
      ),
    },
    {
      key: 'bill_count',
      header: 'Bills',
      sortable: true,
      className: 'text-center',
      render: (c) => <span className="font-semibold tabular-nums">{c.bill_count}</span>,
    },
    {
      key: 'created_at',
      header: 'Added',
      sortable: true,
      render: (c) => <span className="text-muted-foreground">{formatDate(c.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setEditing(c)
              setFormOpen(true)
            }}
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setDeleting(c)
            }}
            aria-label="Delete"
            className="text-danger hover:bg-danger-bg hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Customers" subtitle="Your customer database and purchase history.">
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4.5 w-4.5" /> Add Customer
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchKeys={['name', 'phone', 'address']}
        searchPlaceholder="Search by name or phone…"
        emptyIcon={Users}
        emptyTitle="No customers yet"
        emptyDescription="Add your first customer to start generating bills."
        emptyAction={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4.5 w-4.5" /> Add Customer
          </Button>
        }
      />

      <CustomerForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customer={editing}
        onSaved={fetchCustomers}
      />

      <CustomerHistory open={Boolean(history)} onClose={() => setHistory(null)} customer={history} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete this customer?"
        description={
          deleting ? `“${deleting.name}” will be permanently removed from your database.` : ''
        }
        confirmLabel="Delete customer"
      />
    </div>
  )
}
