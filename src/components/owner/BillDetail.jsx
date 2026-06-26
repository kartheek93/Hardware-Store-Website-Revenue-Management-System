import { useEffect, useState } from 'react'
import { Loader2, Download, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  formatCurrency,
  billNumber,
  formatDateTime,
  effectiveBillStatus,
  STORE,
} from '@/lib/utils'
import { generateBillPDF } from '@/lib/pdf'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PaymentBadge } from '@/components/shared/StatusBadge'

/** Bill detail modal with itemised breakdown + PDF / mark-paid actions. */
export function BillDetail({ open, onClose, bill, onMarkPaid }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!open || !bill) return
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('bill_items')
          .select('*')
          .eq('bill_id', bill.id)
        if (error) throw error
        if (active) setItems(data || [])
      } catch (err) {
        console.error('Load bill items failed:', err)
        if (active) setItems([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [open, bill])

  if (!bill) return null
  const status = effectiveBillStatus(bill)
  const customer = bill.customers || null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={billNumber(bill.id)}
      description={formatDateTime(bill.created_at)}
      footer={
        <>
          {status !== 'Paid' && onMarkPaid && (
            <Button variant="outline" onClick={() => onMarkPaid(bill)}>
              <CheckCircle2 className="h-4 w-4" /> Mark as Paid
            </Button>
          )}
          <Button
            onClick={() => generateBillPDF(bill, items, customer)}
            disabled={loading}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="print-area">
          {/* Store + status header */}
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-base font-bold text-foreground">{STORE.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{STORE.address}</p>
              <p className="text-xs text-muted-foreground">GSTIN: {STORE.gst}</p>
            </div>
            <PaymentBadge status={status} />
          </div>

          {/* Customer */}
          <div className="border-b border-border py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bill to
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {customer?.name || 'Walk-in customer'}
            </p>
            {customer?.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
            {customer?.address && (
              <p className="text-sm text-muted-foreground">{customer.address}</p>
            )}
          </div>

          {/* Items */}
          <div className="overflow-x-auto py-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 text-left font-semibold">Product</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Unit</th>
                  <th className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2.5 pr-2 font-medium text-foreground">{it.product_name}</td>
                    <td className="py-2.5 text-center tabular-nums">{it.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(it.unit_price)}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">
                      {formatCurrency(it.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto mt-2 max-w-xs space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST ({Number(bill.gst_rate)}%)</span>
              <span className="tabular-nums">{formatCurrency(bill.gst_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
              <span>Grand Total</span>
              <span className="tabular-nums text-primary">{formatCurrency(bill.total_amount)}</span>
            </div>
          </div>

          {bill.notes && (
            <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes:</span> {bill.notes}
            </p>
          )}
        </div>
      )}
    </Dialog>
  )
}
