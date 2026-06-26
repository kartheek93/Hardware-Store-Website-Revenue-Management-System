import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes with conflict resolution (shadcn convention). */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Indian Rupee formatter — used everywhere money is displayed.
 * Example: formatCurrency(125000) → "₹1,25,000.00"
 */
export function formatCurrency(amount) {
  const value = Number(amount)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

/** Compact rupee (no decimals) for tight KPI cards. */
export function formatCurrencyShort(amount) {
  const value = Number(amount)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

/** Money-safe arithmetic: rounds to 2 decimals, returns a Number. */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}

/** "12 Jun 2026" */
export function formatDate(dateInput) {
  if (!dateInput) return '—'
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "12 Jun 2026, 4:30 PM" */
export function formatDateTime(dateInput) {
  if (!dateInput) return '—'
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Short bill reference from a UUID, e.g. "INV-9F3A2B". */
export function billNumber(id) {
  if (!id) return 'INV-—'
  return 'INV-' + String(id).replace(/-/g, '').slice(0, 6).toUpperCase()
}

/** Days since a date (used for overdue logic). */
export function daysSince(dateInput) {
  if (!dateInput) return 0
  const then = new Date(dateInput).getTime()
  const now = Date.now()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

/** A bill is overdue when it's unpaid for more than 30 days. */
export function isOverdue(bill) {
  return (
    bill?.payment_status !== 'Paid' &&
    daysSince(bill?.created_at) > 30
  )
}

/** Effective status accounting for the 30-day overdue rule (display-only). */
export function effectiveBillStatus(bill) {
  if (bill?.payment_status === 'Paid') return 'Paid'
  return isOverdue(bill) ? 'Overdue' : 'Outstanding'
}

/**
 * Store details, configurable via env (with safe placeholders).
 * Owner can override these in .env / Vercel without touching code.
 */
export const STORE = {
  name: 'Sri Manikanta Paints, Iron & Hardware',
  shortName: 'Sri Manikanta Hardware',
  city: 'Hyderabad',
  phone: import.meta.env.VITE_STORE_PHONE || '+91 90000 00000',
  whatsapp: (import.meta.env.VITE_STORE_WHATSAPP || '919000000000').replace(/[^0-9]/g, ''),
  address:
    import.meta.env.VITE_STORE_ADDRESS ||
    'Shop No. 00, Main Road, Hyderabad, Telangana 500000',
  gst: import.meta.env.VITE_STORE_GST || '36XXXXXXXXXXXXX',
  email: 'srimanikantahardware@gmail.com',
  mapsEmbed:
    import.meta.env.VITE_STORE_MAPS_EMBED ||
    'https://www.google.com/maps?q=Hyderabad&output=embed',
}

/** Build a wa.me link with an optional prefilled message. */
export function whatsappLink(message) {
  const base = `https://wa.me/${STORE.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const PRODUCT_CATEGORIES = ['Paints', 'Iron & Steel', 'Hardware', 'Tools']

export const DEFAULT_GST_RATE = 18

/**
 * Resize + compress an image File to a JPEG data URL, entirely in the browser.
 * Used so product images can be stored directly in the database (image_url
 * TEXT column) without needing a Supabase Storage bucket.
 *
 * Keeps images small (default max 720px, ~70% quality → typically 40–90 KB)
 * so the public catalogue query stays light.
 */
export function compressImageToDataURL(file, { maxDim = 720, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not decode the image'))
      img.onload = () => {
        let { width, height } = img
        if (width >= height && width > maxDim) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        try {
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch (err) {
          reject(err)
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
