import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { Loader2, TrendingUp, Package } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { formatCurrency, formatCurrencyShort, effectiveBillStatus } from '@/lib/utils'
import { PageHeader } from '@/components/owner/PageHeader'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'

const TABS = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'top', label: 'Top Products' },
]

const PRIMARY = '#D85A30'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function SalesBarChart({ data }) {
  const hasData = data.some((d) => d.sales > 0)
  if (!hasData) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No sales in this period"
        description="Paid bills will appear here as you generate and collect them."
      />
    )
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E0" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B6A65' }} axisLine={{ stroke: '#E7E5E0' }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B6A65' }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(v) => formatCurrencyShort(v)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F1F0EC' }} />
        <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={PRIMARY} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function Reports() {
  const [tab, setTab] = useState('daily')
  const [loading, setLoading] = useState(true)
  const [paidBills, setPaidBills] = useState([])
  const [items, setItems] = useState([])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [bRes, iRes] = await Promise.all([
          supabase.from('bills').select('total_amount, payment_status, created_at'),
          supabase.from('bill_items').select('product_name, quantity, line_total'),
        ])
        if (!active) return
        // Treat effectively-paid bills as revenue.
        const paid = (bRes.data || []).filter((b) => effectiveBillStatus(b) === 'Paid')
        setPaidBills(paid)
        setItems(iRes.data || [])
      } catch (err) {
        console.error('Load reports failed:', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // ── Daily: last 7 days ──
  const dailyData = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      days.push({
        key: d.toDateString(),
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        sales: 0,
      })
    }
    const map = Object.fromEntries(days.map((d) => [d.key, d]))
    for (const b of paidBills) {
      const k = new Date(b.created_at).toDateString()
      if (map[k]) map[k].sales += Number(b.total_amount) || 0
    }
    return days
  }, [paidBills])

  // ── Monthly: last 6 months ──
  const monthlyData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        sales: 0,
      })
    }
    const map = Object.fromEntries(months.map((m) => [m.key, m]))
    for (const b of paidBills) {
      const d = new Date(b.created_at)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (map[k]) map[k].sales += Number(b.total_amount) || 0
    }
    return months
  }, [paidBills])

  // ── Top products by quantity + revenue ──
  const topProducts = useMemo(() => {
    const map = {}
    for (const it of items) {
      const name = it.product_name
      if (!map[name]) map[name] = { name, qty: 0, revenue: 0 }
      map[name].qty += Number(it.quantity) || 0
      map[name].revenue += Number(it.line_total) || 0
    }
    return Object.values(map).sort((a, b) => b.qty - a.qty)
  }, [items])

  const maxRevenue = Math.max(1, ...topProducts.map((p) => p.revenue))

  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales trends and best-selling products." />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      <Card className="p-5 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : tab === 'daily' ? (
          <>
            <h2 className="mb-1 text-base font-semibold text-foreground">Sales — last 7 days</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Total from paid bills, grouped by day.
            </p>
            <SalesBarChart data={dailyData} />
          </>
        ) : tab === 'monthly' ? (
          <>
            <h2 className="mb-1 text-base font-semibold text-foreground">Sales — last 6 months</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Total from paid bills, grouped by month.
            </p>
            <SalesBarChart data={monthlyData} />
          </>
        ) : (
          <>
            <h2 className="mb-1 text-base font-semibold text-foreground">Top products</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Ranked by units sold across all bills.
            </p>
            {topProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No sales data yet"
                description="Once you generate bills, your best-sellers show up here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2.5 pr-3 text-left font-semibold">#</th>
                      <th className="py-2.5 pr-3 text-left font-semibold">Product</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Units Sold</th>
                      <th className="py-2.5 pl-3 text-right font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topProducts.map((p, i) => (
                      <tr key={p.name}>
                        <td className="py-3 pr-3 font-semibold text-muted-foreground">{i + 1}</td>
                        <td className="py-3 pr-3">
                          <p className="font-medium text-foreground">{p.name}</p>
                          <div className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold tabular-nums">{p.qty}</td>
                        <td className="py-3 pl-3 text-right font-bold tabular-nums text-foreground">
                          {formatCurrency(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
