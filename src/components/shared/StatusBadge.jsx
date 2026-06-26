import { Badge } from '@/components/ui/badge'

/**
 * Payment status badge. Pass the bill's effective status string.
 *   Paid → green | Outstanding → amber | Overdue → red
 */
export function PaymentBadge({ status }) {
  const map = {
    Paid: 'success',
    Outstanding: 'warning',
    Overdue: 'danger',
  }
  return <Badge variant={map[status] || 'neutral'}>{status}</Badge>
}

/**
 * Stock status badge derived from quantity + reorder level.
 *   0 → Out of Stock (red) | <= reorder → Low Stock (amber) | else In Stock (green)
 */
export function StockBadge({ stock, reorderLevel = 5, showInStock = true }) {
  const qty = Number(stock) || 0
  if (qty <= 0) return <Badge variant="danger">Out of Stock</Badge>
  if (qty <= Number(reorderLevel)) return <Badge variant="warning">Low Stock · {qty}</Badge>
  if (!showInStock) return <span className="text-sm text-foreground">{qty}</span>
  return <Badge variant="success">In Stock · {qty}</Badge>
}

/** Active / inactive product flag. */
export function ActiveBadge({ active }) {
  return active ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="neutral">Inactive</Badge>
  )
}
