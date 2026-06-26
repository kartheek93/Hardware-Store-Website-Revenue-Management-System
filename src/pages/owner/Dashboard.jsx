import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee,
  CalendarDays,
  AlertTriangle,
  PackageX,
  PlusCircle,
  ArrowRight,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { formatCurrency, effectiveBillStatus, billNumber, formatDate } from '@/lib/utils'
import { PageHeader } from '@/components/owner/PageHeader'
import { KpiCard } from '@/components/owner/KpiCard'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PaymentBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'

function isToday(d) {
  const x = new Date(d)
  const n = new Date()
  return (
    x.getFullYear() === n.getFullYear() &&
    x.getMonth() === n.getMonth() &&
    x.getDate() === n.getDate()
  )
}
function isThisMonth(d) {
  const x = new Date(d)
  const n = new Date()
  return x.getFullYear() === n.getFullYear() && x.getMonth() === n.getMonth()
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    dues: 0,
    lowStock: 0,
    overdue: 0,
  })
  const [recentBills, setRecentBills] = useState([])

  useEffect(() => {
    let active = true
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [billsRes, productsRes, recentRes] = await Promise.all([
          supabase.from('bills').select('total_amount, payment_status, created_at'),
          supabase.from('products').select('stock_qty, reorder_level').eq('is_active', true),
          supabase
            .from('bills')
            .select('id, total_amount, payment_status, created_at, customers(name)')
            .order('created_at', { ascending: false })
            .limit(5),
        ])
        if (billsRes.error) throw billsRes.error
        if (productsRes.error) throw productsRes.error

        const bills = billsRes.data || []
        const products = productsRes.data || []

        let today = 0
        let month = 0
        let dues = 0
        let overdue = 0
        for (const b of bills) {
          const status = effectiveBillStatus(b)
          const amt = Number(b.total_amount) || 0
          if (status === 'Paid') {
            if (isToday(b.created_at)) today += amt
            if (isThisMonth(b.created_at)) month += amt
          } else {
            dues += amt
            if (status === 'Overdue') overdue += 1
          }
        }
        const lowStock = products.filter(
          (p) => Number(p.stock_qty) <= Number(p.reorder_level)
        ).length

        if (!active) return
        setStats({ today, month, dues, lowStock, overdue })
        setRecentBills(recentRes.error ? [] : recentRes.data || [])
      } catch (err) {
        console.error('Dashboard load failed:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="An overview of your store at a glance.">
        <Link to="/owner/bills/new">
          <Button>
            <PlusCircle className="h-4.5 w-4.5" /> New Bill
          </Button>
        </Link>
      </PageHeader>

      {/* KPI cards: 2-col on tablet, 4-col on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Today's Sales"
          value={formatCurrency(stats.today)}
          icon={IndianRupee}
          tone="success"
          hint="Paid bills today"
          loading={loading}
        />
        <KpiCard
          label="This Month's Sales"
          value={formatCurrency(stats.month)}
          icon={CalendarDays}
          tone="primary"
          hint="Paid bills this month"
          loading={loading}
        />
        <KpiCard
          label="Outstanding Dues"
          value={formatCurrency(stats.dues)}
          icon={AlertTriangle}
          tone="warning"
          hint="Unpaid + overdue bills"
          loading={loading}
          to="/owner/bills"
        />
        <KpiCard
          label="Low Stock Items"
          value={stats.lowStock}
          icon={PackageX}
          tone="danger"
          hint="At or below reorder level"
          loading={loading}
          to="/owner/inventory"
        />
      </div>

      {/* Alert banners */}
      {!loading && (stats.lowStock > 0 || stats.overdue > 0) && (
        <div className="mt-5 space-y-3">
          {stats.lowStock > 0 && (
            <Alert
              variant="warning"
              title={`${stats.lowStock} product${stats.lowStock > 1 ? 's are' : ' is'} running low on stock`}
              linkTo="/owner/inventory"
              linkLabel="Review inventory"
            >
              Restock soon to avoid running out.
            </Alert>
          )}
          {stats.overdue > 0 && (
            <Alert
              variant="danger"
              title={`${stats.overdue} bill${stats.overdue > 1 ? 's are' : ' is'} overdue`}
              linkTo="/owner/bills"
              linkLabel="View bills"
            >
              These bills have been unpaid for more than 30 days.
            </Alert>
          )}
        </div>
      )}

      {/* Recent bills */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent bills</h2>
          <Link
            to="/owner/bills"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : recentBills.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No bills yet. Generate your first bill to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentBills.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {b.customers?.name || 'Walk-in customer'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {billNumber(b.id)} · {formatDate(b.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(b.total_amount)}
                    </span>
                    <PaymentBadge status={effectiveBillStatus(b)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
