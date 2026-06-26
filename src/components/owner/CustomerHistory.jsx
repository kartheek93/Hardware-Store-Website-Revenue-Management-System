import { useEffect, useState } from 'react'
import { Loader2, Receipt } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, billNumber, formatDate, effectiveBillStatus } from '@/lib/utils'
import { Dialog } from '@/components/ui/dialog'
import { PaymentBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'

/** Read-only modal showing a customer's bill history. */
export function CustomerHistory({ open, onClose, customer }) {
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState([])

  useEffect(() => {
    if (!open || !customer) return
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('id, total_amount, payment_status, created_at')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        if (active) setBills(data || [])
      } catch (err) {
        console.error('Load customer history failed:', err)
        if (active) setBills([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [open, customer])

  const total = bills.reduce((s, b) => s + Number(b.total_amount || 0), 0)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={customer ? `${customer.name}'s bills` : 'Bill history'}
      description={customer?.phone}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="This customer doesn't have any bills on record."
        />
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              {bills.length} {bills.length === 1 ? 'bill' : 'bills'}
            </span>
            <span className="font-semibold text-foreground">
              Total billed: {formatCurrency(total)}
            </span>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {bills.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{billNumber(b.id)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(b.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">
                    {formatCurrency(b.total_amount)}
                  </span>
                  <PaymentBadge status={effectiveBillStatus(b)} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dialog>
  )
}
