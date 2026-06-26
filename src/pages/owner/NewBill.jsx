import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  formatCurrency,
  round2,
  DEFAULT_GST_RATE,
  PRODUCT_CATEGORIES,
} from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { generateBillPDF } from '@/lib/pdf'
import { PageHeader } from '@/components/owner/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/input'
import { SearchSelect } from '@/components/ui/search-select'
import { Alert } from '@/components/ui/alert'

let rowKey = 0
const newRow = () => ({ key: ++rowKey, productId: '', quantity: 1 })

export default function NewBill() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])

  const [customerId, setCustomerId] = useState('')
  const [rows, setRows] = useState([newRow()])
  const [gstRate, setGstRate] = useState(DEFAULT_GST_RATE)
  const [paymentStatus, setPaymentStatus] = useState('Outstanding')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Load customers + active products.
  useEffect(() => {
    let active = true
    ;(async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        const [cRes, pRes] = await Promise.all([
          supabase.from('customers').select('id, name, phone, address').order('name'),
          supabase
            .from('products')
            .select('id, name, category, selling_price, stock_qty')
            .eq('is_active', true)
            .order('name'),
        ])
        if (!active) return
        setCustomers(cRes.data || [])
        setProducts(pRes.data || [])
      } catch (err) {
        console.error('Load bill data failed:', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const productById = useMemo(() => {
    const m = {}
    for (const p of products) m[p.id] = p
    return m
  }, [products])

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.phone,
    keywords: c.phone,
  }))

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: `${p.category} · Stock ${p.stock_qty} · ${formatCurrency(p.selling_price)}`,
    keywords: p.category,
    disabled: p.stock_qty <= 0,
  }))

  // ── Line item helpers ──
  const updateRow = (key, patch) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const addRow = () => setRows((rs) => [...rs, newRow()])
  const removeRow = (key) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs))

  const lineFor = (row) => {
    const p = productById[row.productId]
    const unit = p ? Number(p.selling_price) : 0
    const qty = Number(row.quantity) || 0
    return { product: p, unit, qty, total: round2(unit * qty) }
  }

  // ── Totals (precise, toFixed-safe) ──
  const subtotal = round2(rows.reduce((s, r) => s + lineFor(r).total, 0))
  const gstAmount = round2((subtotal * Number(gstRate)) / 100)
  const grandTotal = round2(subtotal + gstAmount)

  function validate() {
    if (!customerId) return 'Please select a customer.'
    const filled = rows.filter((r) => r.productId)
    if (filled.length === 0) return 'Add at least one product to the bill.'
    for (const r of filled) {
      const { product, qty } = lineFor(r)
      if (qty <= 0) return `Enter a quantity for “${product?.name}”.`
      if (qty > product.stock_qty)
        return `Only ${product.stock_qty} in stock for “${product.name}”.`
    }
    if (Number(gstRate) < 0 || Number(gstRate) > 100) return 'GST rate must be between 0 and 100.'
    return ''
  }

  async function handleGenerate() {
    const err = validate()
    if (err) {
      setFormError(err)
      return
    }
    setFormError('')
    setSaving(true)

    try {
      const filled = rows.filter((r) => r.productId)

      // 1. Insert the bill.
      const { data: billRows, error: billErr } = await supabase
        .from('bills')
        .insert({
          customer_id: customerId,
          subtotal,
          gst_rate: Number(gstRate),
          gst_amount: gstAmount,
          total_amount: grandTotal,
          payment_status: paymentStatus,
          notes: notes.trim() || null,
        })
        .select()
        .single()
      if (billErr) throw billErr
      const bill = billRows

      // 2. Insert line items (with name/price snapshots).
      const items = filled.map((r) => {
        const { product, unit, qty, total } = lineFor(r)
        return {
          bill_id: bill.id,
          product_id: product.id,
          product_name: product.name,
          unit_price: unit,
          quantity: qty,
          line_total: total,
        }
      })
      const { error: itemsErr } = await supabase.from('bill_items').insert(items)
      if (itemsErr) throw itemsErr

      // 3. Decrement stock per product (aggregate duplicates).
      const decrement = {}
      for (const it of items) {
        decrement[it.product_id] = (decrement[it.product_id] || 0) + it.quantity
      }
      await Promise.all(
        Object.entries(decrement).map(([pid, qty]) => {
          const current = productById[pid]?.stock_qty ?? 0
          return supabase
            .from('products')
            .update({ stock_qty: Math.max(0, current - qty) })
            .eq('id', pid)
        })
      )

      // 4. If paid at creation, record the payment.
      if (paymentStatus === 'Paid') {
        await supabase.from('payments').insert({ bill_id: bill.id, amount_paid: grandTotal })
      }

      // 5. Success + PDF.
      success('Bill generated')
      const customer = customers.find((c) => c.id === customerId)
      generateBillPDF(bill, items, customer)
      navigate('/owner/bills')
    } catch (err) {
      console.error('Generate bill failed:', err)
      toastError('Failed to generate bill. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/owner/bills')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to bills
      </button>

      <PageHeader title="New Bill" subtitle="Generate an itemised invoice for a customer." />

      {customers.length === 0 && (
        <Alert variant="warning" className="mb-5" title="No customers yet" linkTo="/owner/customers" linkLabel="Add a customer">
          You need at least one customer before generating a bill.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: customer + items */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <Label htmlFor="bill-customer" required>
              Customer
            </Label>
            <SearchSelect
              id="bill-customer"
              options={customerOptions}
              value={customerId}
              onChange={setCustomerId}
              placeholder="Select a customer…"
              searchPlaceholder="Search by name or phone…"
            />
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Items</h2>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>

            {/* Column labels (desktop) */}
            <div className="hidden gap-3 px-1 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1fr,84px,110px,110px,40px]">
              <span>Product</span>
              <span>Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            <div className="space-y-3">
              {rows.map((row) => {
                const { product, unit, qty, total } = lineFor(row)
                const overStock = product && qty > product.stock_qty
                return (
                  <div
                    key={row.key}
                    className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-[1fr,84px,110px,110px,40px] sm:items-center sm:border-0 sm:bg-transparent sm:p-1"
                  >
                    <div>
                      <SearchSelect
                        options={productOptions}
                        value={row.productId}
                        onChange={(v) => updateRow(row.key, { productId: v })}
                        placeholder="Select product…"
                        searchPlaceholder="Search products…"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                        className={overStock ? 'border-danger focus-visible:ring-danger' : ''}
                        aria-label="Quantity"
                      />
                      {overStock && (
                        <p className="mt-1 text-xs text-danger">Max {product.stock_qty}</p>
                      )}
                    </div>
                    <div className="text-sm tabular-nums text-foreground sm:text-right">
                      <span className="text-muted-foreground sm:hidden">Unit: </span>
                      {formatCurrency(unit)}
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-foreground sm:text-right">
                      <span className="font-normal text-muted-foreground sm:hidden">Total: </span>
                      {formatCurrency(total)}
                    </div>
                    <div className="flex sm:justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length === 1}
                        aria-label="Remove item"
                        className="text-danger hover:bg-danger-bg hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 p-5">
            <h2 className="text-base font-semibold text-foreground">Summary</h2>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  GST
                  <span className="inline-flex items-center">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="h-7 w-16 px-2 text-right text-xs"
                      aria-label="GST rate"
                    />
                    <span className="ml-1">%</span>
                  </span>
                </dt>
                <dd className="font-semibold tabular-nums">{formatCurrency(gstAmount)}</dd>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                <dt className="text-base font-bold text-foreground">Grand Total</dt>
                <dd className="text-lg font-extrabold tabular-nums text-primary">
                  {formatCurrency(grandTotal)}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <Label htmlFor="bill-status">Payment Status</Label>
              <Select
                id="bill-status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="Outstanding">Outstanding</option>
                <option value="Paid">Paid</option>
              </Select>
            </div>

            <div className="mt-4">
              <Label htmlFor="bill-notes">Notes (optional)</Label>
              <Input
                id="bill-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. delivery on Friday"
              />
            </div>

            {formError && (
              <p className="mt-4 rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger">
                {formError}
              </p>
            )}

            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={handleGenerate}
              loading={saving}
              disabled={customers.length === 0}
            >
              <FileText className="h-4.5 w-4.5" /> Generate Bill & PDF
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Saves the bill, updates stock, and downloads a PDF.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
