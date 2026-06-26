import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, CheckCircle2, Receipt } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  formatCurrency,
  billNumber,
  formatDate,
  effectiveBillStatus,
  isOverdue,
} from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { PageHeader } from '@/components/owner/PageHeader'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { PaymentBadge } from '@/components/shared/StatusBadge'
import { BillDetail } from '@/components/owner/BillDetail'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export default function Bills() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [marking, setMarking] = useState(null)

  const fetchBills = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*, customers(name, phone, address)')
        .order('created_at', { ascending: false })
      if (error) throw error
      const list = data || []

      // Auto-mark long-unpaid bills as Overdue in the DB (best effort).
      const toOverdue = list.filter(
        (b) => b.payment_status === 'Outstanding' && isOverdue(b)
      )
      if (toOverdue.length) {
        await supabase
          .from('bills')
          .update({ payment_status: 'Overdue' })
          .in(
            'id',
            toOverdue.map((b) => b.id)
          )
        toOverdue.forEach((b) => (b.payment_status = 'Overdue'))
      }

      setBills(list)
    } catch (err) {
      console.error('Load bills failed:', err)
      setBills([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  async function markPaid() {
    if (!marking) return
    try {
      const { error } = await supabase
        .from('bills')
        .update({ payment_status: 'Paid' })
        .eq('id', marking.id)
      if (error) throw error
      // Record the payment.
      await supabase
        .from('payments')
        .insert({ bill_id: marking.id, amount_paid: marking.total_amount })
      success('Bill marked as paid')
      setMarking(null)
      setViewing(null)
      fetchBills()
    } catch (err) {
      console.error('Mark paid failed:', err)
      toastError('Failed to update bill.')
      setMarking(null)
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'Bill #',
      sortable: true,
      accessor: (b) => billNumber(b.id),
      render: (b) => <span className="font-semibold text-foreground">{billNumber(b.id)}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      accessor: (b) => b.customers?.name || 'Walk-in',
      render: (b) => (
        <span className="text-foreground">{b.customers?.name || 'Walk-in customer'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (b) => <span className="text-muted-foreground">{formatDate(b.created_at)}</span>,
    },
    {
      key: 'total_amount',
      header: 'Total',
      sortable: true,
      className: 'text-right',
      accessor: (b) => Number(b.total_amount),
      render: (b) => (
        <span className="font-semibold tabular-nums">{formatCurrency(b.total_amount)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Status',
      sortable: true,
      accessor: (b) => effectiveBillStatus(b),
      render: (b) => <PaymentBadge status={effectiveBillStatus(b)} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setViewing(b)} aria-label="View bill">
            <Eye className="h-4 w-4" />
          </Button>
          {effectiveBillStatus(b) !== 'Paid' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMarking(b)}
              aria-label="Mark as paid"
              className="text-success hover:bg-success-bg hover:text-success"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Bills" subtitle="All invoices, payment status and history.">
        <Button onClick={() => navigate('/owner/bills/new')}>
          <Plus className="h-4.5 w-4.5" /> New Bill
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={bills}
        loading={loading}
        searchKeys={['customer', 'id']}
        searchPlaceholder="Search by bill # or customer…"
        emptyIcon={Receipt}
        emptyTitle="No bills yet"
        emptyDescription="Generate your first bill to get started."
        emptyAction={
          <Button onClick={() => navigate('/owner/bills/new')}>
            <Plus className="h-4.5 w-4.5" /> New Bill
          </Button>
        }
        onRowClick={(b) => setViewing(b)}
      />

      <BillDetail
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        bill={viewing}
        onMarkPaid={(b) => setMarking(b)}
      />

      <ConfirmDialog
        open={Boolean(marking)}
        onClose={() => setMarking(null)}
        onConfirm={markPaid}
        title="Mark this bill as paid?"
        description={
          marking
            ? `${billNumber(marking.id)} for ${formatCurrency(marking.total_amount)} will be marked as paid and recorded in payments.`
            : ''
        }
        confirmLabel="Mark as Paid"
        variant="warning"
      />
    </div>
  )
}
